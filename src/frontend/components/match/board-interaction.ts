import { canBufferAttack, type ActionQueueState } from "frontend/utils/action-queue";
import type { BoardPosition, MatchView } from "./match-view";
import {
  DIRECTION_OFFSET,
  getPlayerById,
  getTileAt,
  getUnitAt,
  isOutOfBounds,
  samePosition,
  type BoardDirection,
} from "./match-view";
import { updateTracedPath } from "./path-planning";
import {
  attackTargetsFrom,
  canLaunchFrom,
  isLoadableTile,
  reconstructPath,
  repairTargetsAt,
  unloadDropsAt,
  type RepairTarget,
  type SnapshotUnit,
  type TurnSnapshot,
  type UnloadDrop,
} from "./turn-snapshot-view";

/**
 * Pure board-interaction logic for the v2 snapshot board — the game-affordance decisions the board
 * makes, lifted out of `MatchBoardV2`'s imperative pixi effect so they can be unit-tested. Nothing
 * here touches pixi, React, refs, or the network: functions take the current view / snapshot / queue
 * and return plain descriptions of what's possible. The component maps those to rendering + enqueues.
 */

type PriceTable = TurnSnapshot["production"]["priceTable"];

/** Reachable tiles this unit may PLAIN-move onto (own tile, empty tiles, or valid load/join tiles). */
export const movableTiles = (view: MatchView, unit: SnapshotUnit): BoardPosition[] =>
  unit.reachableTiles
    .map((tile) => tile.position)
    .filter(
      (pos) =>
        samePosition(pos, unit.position) ||
        getUnitAt(view, pos) === undefined ||
        isLoadableTile(unit, pos),
    );

/**
 * The route to commit for a move to `dest`: the cursor-traced path when it already ends at `dest`,
 * otherwise the snapshot's shortest path. Returns null when `dest` isn't reachable.
 */
export const commitPath = (
  unit: SnapshotUnit,
  dest: BoardPosition,
  tracedPath: readonly BoardPosition[],
): BoardPosition[] | null => {
  if (tracedPath.length >= 1 && samePosition(tracedPath[tracedPath.length - 1], dest)) {
    return [...tracedPath];
  }

  return reconstructPath(unit, dest);
};

/**
 * Fallback unload drops for cargo the turn-start snapshot doesn't know about (a load buffered THIS
 * turn): the adjacent in-bounds, empty tiles around `dest`, one set per loaded slot. Terrain isn't
 * checked here — the BE validates it and rejects a bad drop, so it can't desync.
 */
export const optimisticUnloadDrops = (
  view: MatchView,
  unit: SnapshotUnit,
  dest: BoardPosition,
): UnloadDrop[] => {
  const transport = getUnitAt(view, unit.position) as
    | { loadedUnit?: unknown; loadedUnit2?: unknown }
    | undefined;

  if (transport === undefined) {
    return [];
  }

  const slots: boolean[] = [];

  if ("loadedUnit" in transport && transport.loadedUnit != null) {
    slots.push(false);
  }

  if ("loadedUnit2" in transport && transport.loadedUnit2 != null) {
    slots.push(true);
  }

  const drops: UnloadDrop[] = [];

  for (const isSecondUnit of slots) {
    for (const direction of Object.keys(DIRECTION_OFFSET) as BoardDirection[]) {
      const [dx, dy] = DIRECTION_OFFSET[direction];
      const position: [number, number] = [dest[0] + dx, dest[1] + dy];

      if (!isOutOfBounds(view, position) && getUnitAt(view, position) === undefined) {
        drops.push({ isSecondUnit, direction, position });
      }
    }
  }

  return drops;
};

/** One buildable entry for a production facility, flagged by whether the player can currently afford it. */
export type BuildableUnit = { type: PriceTable[number]["type"]; cost: number; selectable: boolean };

/** Affordable-sorted units a facility can build, each flagged selectable against `funds`. */
export const buildableUnits = (
  priceTable: PriceTable,
  facility: string,
  funds: number,
): BuildableUnit[] =>
  priceTable
    .filter((entry) => entry.facility === facility)
    .sort((a, b) => a.cost - b.cost)
    .map((entry) => ({ type: entry.type, cost: entry.cost, selectable: entry.cost <= funds }));

/**
 * An action offered when a move is staged at a tile. `kind` is what it does; the component maps it to
 * a labelled menu entry and the matching enqueue/overlay. Ordering mirrors the board menu exactly.
 */
export type StageAction =
  | { kind: "load-join"; label: string }
  | { kind: "attack"; label: string; targets: BoardPosition[] }
  | { kind: "capture"; label: string }
  | { kind: "unload"; label: string; drops: UnloadDrop[] }
  | { kind: "ability"; label: string }
  | { kind: "launch"; label: string }
  | { kind: "repair"; label: string; targets: RepairTarget[] }
  | { kind: "delete"; label: string }
  | { kind: "wait"; label: string };

/** The affordances (and latched attack targets) when a unit stages a move at `dest`. */
export type StageResult = { actions: StageAction[]; attackTargets: BoardPosition[] };

/**
 * Decide which actions a unit can take from a staged destination — the branching that used to live
 * inline in `stageMove`. Returns null when the tile is a friendly the engine won't let us load/join
 * into (no menu at all); otherwise the ordered action list plus the attack targets to latch.
 */
export const stageActions = (
  view: MatchView,
  unit: SnapshotUnit,
  dest: BoardPosition,
  queue: ActionQueueState,
  playerId: string,
): StageResult | null => {
  const myPlayer = getPlayerById(view, playerId);
  const destTile = getTileAt(view, dest);
  const occupant = getUnitAt(view, dest);

  // Onto a friendly unit: a LOAD or JOIN, but only when the engine says it's valid.
  if (occupant !== undefined && !samePosition(dest, unit.position)) {
    if (!isLoadableTile(unit, dest)) {
      return null; // occupied by a friendly the BE won't let us load/join into — no action here
    }

    const label = occupant.type === unit.type ? "JOIN" : "LOAD";

    return { actions: [{ kind: "load-join", label }], attackTargets: [] };
  }

  const canCapture =
    (unit.type === "infantry" || unit.type === "mech") &&
    myPlayer !== undefined &&
    "playerSlot" in destTile &&
    destTile.playerSlot !== myPlayer.slot;

  const targets = attackTargetsFrom(unit, dest);
  // An attack can only be offered if no earlier attack is still unresolved (they serialize).
  const canAttack = targets.length > 0 && canBufferAttack(queue);

  // Unload drops from the snapshot; if the snapshot has no unload data for this transport at all (a
  // load buffered this turn it doesn't know about), fall back to adjacent empty tiles.
  let drops = unloadDropsAt(unit, dest);

  if (drops.length === 0 && unit.unloadsByTile.length === 0) {
    drops = optimisticUnloadDrops(view, unit, dest);
  }

  const actions: StageAction[] = [];

  if (canAttack) {
    actions.push({ kind: "attack", label: "ATTACK", targets });
  }

  if (canCapture) {
    actions.push({ kind: "capture", label: "CAPTURE" });
  }

  if (drops.length > 0) {
    actions.push({ kind: "unload", label: "UNLOAD", drops });
  }

  // Ability: APC supply, or a sub/stealth toggle. A sub DIVE/SURFACEs; an aircraft (stealth) HIDE/APPEARs.
  if (unit.ability !== null) {
    const conceal = unit.type === "sub" ? "DIVE" : "HIDE";
    const reveal = unit.type === "sub" ? "SURFACE" : "APPEAR";
    const abilityLabel = { supply: "SUPPLY", hide: conceal, reveal }[unit.ability.kind];
    actions.push({ kind: "ability", label: abilityLabel });
  }

  if (canLaunchFrom(unit, dest)) {
    actions.push({ kind: "launch", label: "LAUNCH" });
  }

  const repairTargets = repairTargetsAt(unit, dest);

  if (repairTargets.length > 0) {
    actions.push({ kind: "repair", label: "REPAIR", targets: repairTargets });
  }

  // Delete (self-destruct) is an in-place main action — only on the unit's own tile.
  if (samePosition(dest, unit.position)) {
    actions.push({ kind: "delete", label: "DELETE" });
  }

  actions.push({ kind: "wait", label: "WAIT" });

  return { actions, attackTargets: canAttack ? targets : [] };
};

/** The current imperative interaction state a tile click is resolved against. */
export type InteractionState = {
  selection: BoardPosition | null;
  stagedDest: BoardPosition | null;
  attackTargets: readonly BoardPosition[];
  unloadDrops: readonly UnloadDrop[];
  missileArm: { path: readonly BoardPosition[] } | null;
};

/**
 * What a click on `pos` means, given the current view / snapshot / interaction state — the routing
 * that used to live inline in `onTileClick`. The component performs the resulting effect (enqueue,
 * open a menu, redraw); this only classifies. `from` is the origin a move commits from.
 */
export type TileClickResult =
  | { type: "none" }
  | { type: "reset" }
  | { type: "launch"; path: readonly BoardPosition[]; target: BoardPosition }
  | { type: "unload"; unit: SnapshotUnit; from: BoardPosition; drop: UnloadDrop }
  | { type: "attack"; unit: SnapshotUnit; from: BoardPosition; defender: BoardPosition }
  | { type: "stage"; unit: SnapshotUnit; dest: BoardPosition }
  | { type: "build"; position: BoardPosition; facility: "base" | "airport" | "port" }
  | { type: "select"; unit: SnapshotUnit; pos: BoardPosition };

const snapshotUnitAt = (snapshot: TurnSnapshot, pos: BoardPosition): SnapshotUnit | undefined =>
  snapshot.units.find((unit) => samePosition(unit.position, pos));

const inList = (list: readonly BoardPosition[], pos: BoardPosition): boolean =>
  list.some((p) => samePosition(p, pos));

export const classifyTileClick = (
  view: MatchView,
  snapshot: TurnSnapshot | null,
  pos: BoardPosition,
  state: InteractionState,
  queue: ActionQueueState,
  playerId: string,
): TileClickResult => {
  // Arming a missile: the next click is the strike target (every board tile is in-bounds).
  if (state.missileArm !== null) {
    return { type: "launch", path: state.missileArm.path, target: pos };
  }

  // With a unit selected: unload onto a green drop, attack a red target, or stage a move.
  if (state.selection !== null && snapshot !== null) {
    const unit = snapshotUnitAt(snapshot, state.selection);

    if (unit !== undefined) {
      const from = state.stagedDest ?? state.selection;
      const drop = state.unloadDrops.find((entry) => samePosition(entry.position, pos));

      if (drop !== undefined) {
        return { type: "unload", unit, from, drop };
      }

      if (inList(state.attackTargets, pos) && canBufferAttack(queue)) {
        return { type: "attack", unit, from, defender: pos };
      }

      if (inList(movableTiles(view, unit), pos)) {
        return { type: "stage", unit, dest: pos };
      }
    }
  }

  // An owned, empty production facility -> open its build menu.
  const tile = getTileAt(view, pos);
  const facility =
    tile.type === "base" || tile.type === "airport" || tile.type === "port" ? tile.type : null;
  const buildPlayer = getPlayerById(view, playerId);

  if (
    facility !== null &&
    buildPlayer !== undefined &&
    "playerSlot" in tile &&
    tile.playerSlot === buildPlayer.slot &&
    getUnitAt(view, pos) === undefined
  ) {
    return { type: "build", position: pos, facility };
  }

  // Otherwise: (re)select an own, ready unit that can move, or clear.
  if (snapshot === null) {
    return { type: "reset" };
  }

  const myPlayer = getPlayerById(view, playerId);
  const unitHere = getUnitAt(view, pos);
  const snapshotUnit = snapshotUnitAt(snapshot, pos);

  if (
    myPlayer !== undefined &&
    unitHere !== undefined &&
    unitHere.playerSlot === myPlayer.slot &&
    snapshotUnit !== undefined &&
    snapshotUnit.reachableTiles.length > 0
  ) {
    return { type: "select", unit: snapshotUnit, pos };
  }

  return { type: "reset" };
};

// Re-exported so the component's traced-path handling stays in one import site.
export { updateTracedPath };
