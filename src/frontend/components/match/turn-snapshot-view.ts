import type { inferTRPCOutput } from "frontend/utils/trpc-client";
import type { BoardPosition } from "./match-view";
import { samePosition } from "./match-view";

/**
 * The turn snapshot the backend sends at the start of a player's turn — the client buffers this
 * turn's simple actions against it (see `src/frontend/CLAUDE.md`). Typed purely by tRPC inference.
 */
export type TurnSnapshot = NonNullable<inferTRPCOutput<"matchPreview", "turnSnapshot">>;
export type SnapshotUnit = TurnSnapshot["units"][number];
/** An owned, empty production facility a unit can be built on this turn. */
export type BuildableTile = TurnSnapshot["production"]["buildableTiles"][number];
/** The acting player's CO-power state: meter, star breakdown, and each activatable power. */
export type PowerInfo = TurnSnapshot["power"];

/** The snapshot entry for a unit at `position`, if any. */
export const snapshotUnitAt = (
  snapshot: TurnSnapshot,
  position: BoardPosition,
): SnapshotUnit | undefined => snapshot.units.find((unit) => samePosition(unit.position, position));

/**
 * Enemy tiles this unit can attack when firing from `from` (a move destination, or its own tile for
 * an in-place attack). Read straight from the precomputed snapshot — no round-trip — so the player
 * can plan an attack while offline / throttled. Empty when nothing is attackable from there.
 */
export const attackTargetsFrom = (unit: SnapshotUnit, from: BoardPosition): BoardPosition[] =>
  unit.attacksByTile.find((entry) => samePosition(entry.from, from))?.targets ?? [];

/** Whether moving onto `dest` is a valid load/join for this unit (precomputed by the engine). */
export const isLoadableTile = (unit: SnapshotUnit, dest: BoardPosition): boolean =>
  unit.loadableTiles.some((tile) => samePosition(tile, dest));

/** One valid unload: which cargo slot, which direction, and the resulting drop tile. */
export type UnloadDrop = SnapshotUnit["unloadsByTile"][number]["drops"][number];

/** Valid unload drops available when this (transport) unit is staged at `dest`. */
export const unloadDropsAt = (unit: SnapshotUnit, dest: BoardPosition): UnloadDrop[] =>
  unit.unloadsByTile.find((entry) => samePosition(entry.from, dest))?.drops ?? [];

/** Whether an infantry/mech can launch a missile from `dest` (an unfired silo it can reach). */
export const canLaunchFrom = (unit: SnapshotUnit, dest: BoardPosition): boolean =>
  unit.launchTiles.some((tile) => samePosition(tile, dest));

/** One valid black-boat repair: which direction, and the friendly unit's tile. */
export type RepairTarget = SnapshotUnit["repairsByTile"][number]["targets"][number];

/** Friendly units a black boat staged at `dest` can repair (direction + target tile). */
export const repairTargetsAt = (unit: SnapshotUnit, dest: BoardPosition): RepairTarget[] =>
  unit.repairsByTile.find((entry) => samePosition(entry.from, dest))?.targets ?? [];

/**
 * Reconstruct the move path from a unit's start tile to `destination` by walking the snapshot's
 * parent pointers — a plain array walk, no pathfinding. Returns null when `destination` isn't in the
 * unit's reachable set. The path runs start -> ... -> destination, as the move action expects.
 */
export const reconstructPath = (
  unit: SnapshotUnit,
  destination: BoardPosition,
): BoardPosition[] | null => {
  const key = (p: BoardPosition) => `${p[0]},${p[1]}`;
  const byPosition = new Map(unit.reachableTiles.map((tile) => [key(tile.position), tile]));

  let current = byPosition.get(key(destination));

  if (current === undefined) {
    return null;
  }

  const reversePath: BoardPosition[] = [];

  while (current !== undefined) {
    reversePath.push(current.position);
    current = current.parent === null ? undefined : byPosition.get(key(current.parent));
  }

  return reversePath.reverse();
};
