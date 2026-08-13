import type { QueuedAction } from "frontend/utils/action-queue";
import type { BoardPosition, MatchUnit, MatchView } from "./match-view";
import { DIRECTION_OFFSET, samePosition } from "./match-view";
import type { TurnSnapshot } from "./turn-snapshot-view";

/**
 * Apply the buffered action stack to the authoritative `MatchView` as PURE PRESENTATION DELTAS —
 * no engine, no rules (see the locked design in `src/frontend/CLAUDE.md`). The board renders
 * `authoritative snapshot + pending intent`, never a second authoritative copy, so it can't desync.
 *
 * Only the three "simple" kinds preview locally; combat is never resolved on the client:
 *  - move            -> slide the unit from its start tile to the path's end tile.
 *  - capture         -> same slide, plus tick capture points at the unit's known rate (icon shows).
 *  - production       -> place a full-HP ghost unit and subtract its price-table cost from funds.
 *  - attack (move+atk) -> the attacker slides to its firing tile; the fight itself is BE-only.
 *
 * Everything here is dropped the moment the BE's authoritative state lands (the action is confirmed
 * and removed from the buffer), so a built unit is a throwaway render-only ghost — hence the single
 * contained cast when synthesising it.
 */

type PriceTable = TurnSnapshot["production"]["priceTable"];

const costOf = (priceTable: PriceTable, unitType: string): number =>
  priceTable.find((entry) => entry.type === unitType)?.cost ?? 0;

/** A transport's cargo as read from the plain view data (loadedUnit lives on transport variants). */
type WithCargo = {
  loadedUnit?: { type: string } | null;
  loadedUnit2?: { type: string } | null;
  playerSlot: number;
};

/**
 * A render-only stand-in for a just-built unit. `renderUnitFromView` reads only position, type,
 * isReady, stats.hp and (absence of) currentCapturePoints, so we fill those and cast past the full
 * 17-variant unit union — this object never reaches the BE, it only feeds the optimistic sprite.
 */
const ghostBuiltUnit = (position: BoardPosition, unitType: string, playerSlot: number): MatchUnit =>
  ({
    type: unitType,
    playerSlot,
    position: [position[0], position[1]],
    isReady: false,
    stats: { hp: 100, fuel: 99, ammo: 99 },
  }) as unknown as MatchUnit;

export const applyBufferedActions = (
  match: MatchView,
  myPlayerId: string,
  snapshot: TurnSnapshot | null,
  actions: QueuedAction[],
): MatchView => {
  const me = match.players.find((player) => player.id === myPlayerId);

  if (me === undefined || actions.length === 0) {
    return match;
  }

  let units: MatchUnit[] = match.units;
  let funds = me.funds;

  const slideUnit = (
    from: BoardPosition,
    to: BoardPosition,
    patch?: (unit: MatchUnit) => Partial<MatchUnit>,
  ) => {
    units = units.map((unit) =>
      samePosition(unit.position, from)
        ? // Spreading a union member widens its type; this is a render-only delta, so re-narrow.
          ({
            ...unit,
            position: [to[0], to[1]],
            isReady: false,
            ...(patch?.(unit) ?? {}),
          } as MatchUnit)
        : unit,
    );
  };

  for (const { action, kind } of actions) {
    if (action.type === "build") {
      funds -= costOf(snapshot?.production.priceTable ?? [], action.unitType);
      units = [...units, ghostBuiltUnit(action.position, action.unitType, me.slot)];
      continue;
    }

    // DELETE: self-destruct removes the unit from the board immediately (a main action, no move).
    if (action.type === "delete") {
      units = units.filter((unit) => !samePosition(unit.position, action.position));
      continue;
    }

    if (action.type !== "move") {
      continue; // passTurn and standalone attack/ability don't buffer as presentation deltas
    }

    // A malformed/empty path would make `from`/`to` undefined and crash samePosition/slideUnit below.
    if (action.path.length === 0) {
      continue;
    }

    const from = action.path[0];
    const to = action.path[action.path.length - 1];

    // UNLOAD: the transport moves to `to`, then drops each carried unit onto an adjacent tile.
    // Preview both — slide the transport AND place a ghost of each dropped unit — so we never end up
    // with a hidden/stacked unit; the BE reconciles the real HP on confirm.
    if (action.subAction.type === "unloadWait") {
      const transport = units.find((unit) => samePosition(unit.position, from)) as
        | (MatchUnit & WithCargo)
        | undefined;

      slideUnit(from, to);

      if (transport !== undefined) {
        for (const unload of action.subAction.unloads) {
          const cargo = unload.isSecondUnit ? transport.loadedUnit2 : transport.loadedUnit;
          const offset = DIRECTION_OFFSET[unload.direction];

          if (cargo != null && offset !== undefined) {
            const dropTile: BoardPosition = [to[0] + offset[0], to[1] + offset[1]];
            units = [...units, ghostBuiltUnit(dropTile, cargo.type, transport.playerSlot)];
          }
        }
      }

      continue;
    }

    // Moving onto an occupied friendly tile is a LOAD (into a transport) or JOIN (merge same type):
    // the moved unit is absorbed into the one already there. Preview that faithfully by removing it
    // from the board — it's now cargo / merged, exactly what authoritative state will show. Don't
    // stack two sprites on one tile. If the BE rejects the load, the buffer rolls back and it
    // reappears at its origin, so nothing is ever really lost.
    // Only an OWN unit already on `to` is a load/join — an enemy-occupied tile must never make us
    // silently absorb (delete) the moved unit. The board's movableTiles filter should keep us off
    // enemy tiles anyway, but this reducer must not depend on a guarantee enforced elsewhere.
    const isLoadOrJoin =
      !samePosition(from, to) &&
      units.some(
        (unit) =>
          samePosition(unit.position, to) &&
          !samePosition(unit.position, from) &&
          unit.playerSlot === me.slot,
      );

    if (isLoadOrJoin) {
      const moved = units.find((unit) => samePosition(unit.position, from));

      units = units
        .filter((unit) => !samePosition(unit.position, from))
        .map((unit) => {
          if (moved === undefined || !samePosition(unit.position, to)) {
            return unit;
          }

          // Put the absorbed unit into the transport's first free slot so its cargo shows right away
          // (a JOIN into a same-type unit has no cargo slot — leave it, the moved unit just merges).
          const carrier = unit as MatchUnit & WithCargo;

          if ("loadedUnit" in carrier && carrier.loadedUnit == null) {
            return { ...carrier, loadedUnit: moved } as MatchUnit;
          }

          if ("loadedUnit2" in carrier && carrier.loadedUnit2 == null) {
            return { ...carrier, loadedUnit2: moved } as MatchUnit;
          }

          return unit;
        });

      continue;
    }

    if (kind === "capture") {
      const snapshotUnit = snapshot?.units.find((unit) => samePosition(unit.position, from));
      const rate = snapshotUnit?.captureRate ?? 0;
      const current = snapshotUnit?.currentCapturePoints ?? 20;
      const remaining = Math.max(0, current - rate);

      // Tick capture points so the "capturing" badge appears optimistically.
      slideUnit(from, to, () => ({ currentCapturePoints: remaining }) as Partial<MatchUnit>);
      continue;
    }

    // ABILITY (dive/surface/supply): slide, and for a sub/stealth toggle its hidden flag so the
    // dived sprite dims right away. Supply has no visible delta beyond the move (fuel/ammo isn't
    // rendered). Capture is also an "ability" subaction but is handled above by its own kind.
    if (action.subAction.type === "ability") {
      slideUnit(from, to, (unit) =>
        "hidden" in unit
          ? ({ hidden: !(unit as { hidden: boolean }).hidden } as Partial<MatchUnit>)
          : {},
      );
      continue;
    }

    // move, move-and-attack, launch missile, black-boat repair: just relocate the unit; combat,
    // missile damage and repair heal/funds are all resolved by the BE.
    slideUnit(from, to);
  }

  return {
    ...match,
    units,
    players: match.players.map((player) =>
      player.id === myPlayerId ? { ...player, funds } : player,
    ),
  };
};
