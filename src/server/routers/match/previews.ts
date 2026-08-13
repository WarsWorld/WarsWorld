import { playerInMatchBaseProcedure, router } from "server/trpc/trpc-setup";
import { DispatchableError } from "server/engine/DispatchedError";
import { getBattleForecast } from "server/engine/previews/combat-forecast";
import { getAvailableSubActions } from "server/engine/events/available-sub-actions";
import { getUnloadablePositions } from "server/engine/events/handlers/unload/checkUnloadTiles";
import { getAccessibleNodes, getAttackTargetTiles } from "server/engine/previews/pathfinding";
import type { UnitType } from "shared/schemas/unit";
import { unitTypeSchema } from "shared/schemas/unit";
import { buildTurnSnapshot } from "./turn-snapshot";
import type { MatchWrapper } from "server/engine/entities/match";
import type { PlayerInMatchWrapper } from "server/engine/entities/player-in-match";
import { positionSchema, isSamePosition } from "shared/schemas/position";
import type { Position } from "shared/schemas/position";
import { z } from "zod";

/**
 * Read-only preview queries: what a unit can do, where it can go/attack, and how an engagement
 * would play out. The backend is authoritative — it computes these from match state and the client
 * merely renders them (it must not run the engine). Each is turn- and ownership-gated by
 * `playerInMatchBaseProcedure`.
 *
 * TODO(fog): reachability still computes over full match state. `matchRouter.full` already
 * fog-filters its units and exposes `visibleTiles`, and `combatForecast` below is gated on
 * fog-aware targeting — so the remaining leak is `reachableTiles`/`turnSnapshot`, where a reachable
 * set that stops short of a hidden unit reveals its position.
 */

const getOwnedUnitOrThrow = (
  match: MatchWrapper,
  player: PlayerInMatchWrapper,
  position: Position,
) => {
  const unit = match.getUnitOrThrow(position);

  if (unit.data.playerSlot !== player.data.slot) {
    throw new DispatchableError("You don't own this unit");
  }

  return unit;
};

export const matchPreviewRouter = router({
  /**
   * Everything the client needs to buffer simple actions this turn without any rules knowledge
   * (see `src/frontend/CLAUDE.md`): per-unit reachable tiles, capture state, and production data.
   * Fetched once at the start of the player's turn; the client applies its buffered moves/captures/
   * production against this and lets the backend reconcile.
   */
  turnSnapshot: playerInMatchBaseProcedure.query(({ ctx: { match, player } }) =>
    buildTurnSnapshot(match, player),
  ),

  /** Tiles the unit can move to, with the shortest-path distance and parent for path drawing. */
  reachableTiles: playerInMatchBaseProcedure
    .input(z.object({ unitPosition: positionSchema }))
    .query(({ ctx: { match, player }, input }) => {
      const unit = getOwnedUnitOrThrow(match, player, input.unitPosition);

      return Array.from(getAccessibleNodes(match, unit).values());
    }),

  /** Enemy units / pipe seams the unit could attack, optionally from a moved-to position. */
  attackTargets: playerInMatchBaseProcedure
    .input(z.object({ unitPosition: positionSchema, fromPosition: positionSchema.optional() }))
    .query(({ ctx: { match, player }, input }) => {
      const unit = getOwnedUnitOrThrow(match, player, input.unitPosition);

      return getAttackTargetTiles(match, unit, input.fromPosition);
    }),

  /** Sub-actions available to the unit after moving to `toPosition` (wait/capture/attack/...). */
  availableActions: playerInMatchBaseProcedure
    .input(
      z.object({
        unitPosition: positionSchema,
        toPosition: positionSchema,
        hasMoved: z.boolean(),
      }),
    )
    .query(({ ctx: { match, player }, input }) => {
      const unit = getOwnedUnitOrThrow(match, player, input.unitPosition);
      const actions = getAvailableSubActions(match, player, unit, input.toPosition, input.hasMoved);

      return Array.from(actions.entries()).map(([action, subAction]) => ({ action, subAction }));
    }),

  /** Tiles a transport (optionally at a moved-to position) can drop a carried unit type onto. */
  unloadTargets: playerInMatchBaseProcedure
    .input(
      z.object({
        transportPosition: positionSchema,
        unitToUnloadType: unitTypeSchema,
        toPosition: positionSchema.optional(),
      }),
    )
    .query(({ ctx: { match, player }, input }): Position[] => {
      const transport = getOwnedUnitOrThrow(match, player, input.transportPosition);
      const unitToUnload: { type: UnitType } = { type: input.unitToUnloadType };

      return getUnloadablePositions(transport, unitToUnload, input.toPosition);
    }),

  /** Min/max damage each side would take if the attacker (at `toPosition`) hits `targetPosition`. */
  combatForecast: playerInMatchBaseProcedure
    .input(
      z.object({
        attackerPosition: positionSchema,
        toPosition: positionSchema,
        targetPosition: positionSchema,
      }),
    )
    .query(({ ctx: { match, player }, input }) => {
      const attacker = getOwnedUnitOrThrow(match, player, input.attackerPosition);

      // Only forecast against a target the attacker can actually, VISIBLY attack from `toPosition`.
      // getAttackTargetTiles is fog-aware (hidden/dived enemies aren't offered), so gating on it both
      // rejects illegal/stale targets with a typed error instead of a raw 500, AND closes the fog
      // probe leak — a concealed enemy can't be forecast because it is never a valid target here.
      const targets = getAttackTargetTiles(match, attacker, input.toPosition);

      if (!targets.some((target) => isSamePosition(target, input.targetPosition))) {
        throw new DispatchableError("That target can't be attacked from that position");
      }

      return getBattleForecast(match, attacker, input.toPosition, input.targetPosition);
    }),
});
