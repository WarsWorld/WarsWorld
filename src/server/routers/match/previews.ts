import { playerInMatchBaseProcedure, router } from "server/trpc/trpc-setup";
import { DispatchableError } from "shared/DispatchedError";
import { getBattleForecast } from "shared/match-logic/combat-forecast";
import { getAvailableSubActions } from "shared/match-logic/events/available-sub-actions";
import { getUnloadablePositions } from "shared/match-logic/events/handlers/unload/checkUnloadTiles";
import { getAccessibleNodes, getAttackTargetTiles } from "shared/match-logic/pathfinding";
import type { UnitType } from "shared/schemas/unit";
import { unitTypeSchema } from "shared/schemas/unit";
import { buildTurnSnapshot } from "./turn-snapshot";
import type { MatchWrapper } from "shared/wrappers/match";
import type { PlayerInMatchWrapper } from "shared/wrappers/player-in-match";
import { positionSchema } from "shared/schemas/position";
import type { Position } from "shared/schemas/position";
import { z } from "zod";

/**
 * Read-only preview queries: what a unit can do, where it can go/attack, and how an engagement
 * would play out. The backend is authoritative — it computes these from match state and the client
 * merely renders them (it must not run the engine). Each is turn- and ownership-gated by
 * `playerInMatchBaseProcedure`.
 *
 * TODO(fog): these compute over full match state, matching today's `match.full` (which does not yet
 * fog-filter). When fog-of-war projection lands, previews must be derived from the requesting
 * player's visible state so hidden units don't leak.
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

      return getBattleForecast(match, attacker, input.toPosition, input.targetPosition);
    }),
});
