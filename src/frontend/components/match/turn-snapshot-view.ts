import type { inferTRPCOutput } from "frontend/utils/trpc-client";
import type { BoardPosition } from "./match-view";
import { samePosition } from "./match-view";

/**
 * The turn snapshot the backend sends at the start of a player's turn — the client buffers this
 * turn's simple actions against it (see `src/frontend/CLAUDE.md`). Typed purely by tRPC inference.
 */
export type TurnSnapshot = NonNullable<inferTRPCOutput<"matchPreview", "turnSnapshot">>;
export type SnapshotUnit = TurnSnapshot["units"][number];

/** The snapshot entry for a unit at `position`, if any. */
export const snapshotUnitAt = (
  snapshot: TurnSnapshot,
  position: BoardPosition,
): SnapshotUnit | undefined => snapshot.units.find((unit) => samePosition(unit.position, position));

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
