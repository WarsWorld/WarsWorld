import type { BoardPosition } from "./match-view";
import { posKey, samePosition } from "./match-view";
import { reconstructPath, type SnapshotUnit } from "./turn-snapshot-view";

/**
 * AW-style cursor path routing, driven purely by the turn snapshot (no engine). As the cursor moves
 * over reachable tiles the traced path extends to follow it — append an affordable neighbour of the
 * current end, truncate on backtrack — and falls back to the shortest path when the cursor jumps. The
 * exact route matters in fog: it decides which tiles the unit crosses (and where it might trap).
 */

type ReachInfo = { parent: BoardPosition | null; cost: number };

const areNeighbours = (a: BoardPosition, b: BoardPosition): boolean =>
  Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;

const reachableMap = (unit: SnapshotUnit): Map<string, ReachInfo> => {
  const map = new Map<string, ReachInfo>();

  for (const tile of unit.reachableTiles) {
    map.set(posKey(tile.position), { parent: tile.parent, cost: tile.cost });
  }

  return map;
};

/** Movement points spent by the traced path (every tile after the origin costs its entry cost). */
const pathDistance = (reachable: Map<string, ReachInfo>, path: BoardPosition[]): number => {
  let dist = 0;

  for (let i = 1; i < path.length; i++) {
    dist += reachable.get(posKey(path[i]))?.cost ?? 0;
  }

  return dist;
};

export const updateTracedPath = (
  unit: SnapshotUnit,
  path: BoardPosition[],
  newPos: BoardPosition,
): BoardPosition[] => {
  const reachable = reachableMap(unit);

  // Can only route onto reachable tiles (the origin is always in the reachable set).
  if (reachable.get(posKey(newPos)) === undefined) {
    return path;
  }

  if (path.length !== 0) {
    // Backtrack: the cursor is on a tile already in the path — drop everything after it.
    const index = path.findIndex((p) => samePosition(p, newPos));

    if (index !== -1) {
      return path.slice(0, index + 1);
    }

    // Extend: an affordable neighbour of the current end just appends onto the trace.
    const end = path[path.length - 1];
    const info = reachable.get(posKey(newPos));

    if (
      info !== undefined &&
      areNeighbours(end, newPos) &&
      info.cost + pathDistance(reachable, path) <= unit.movementPoints
    ) {
      return [...path, newPos];
    }
  }

  // Cursor jumped (or the trace can't reach): fall back to the snapshot's shortest path to it —
  // the same parent-walk reused from turn-snapshot-view (single source of truth).
  const rebuilt = reconstructPath(unit, newPos);

  return rebuilt === null || rebuilt.length === 0 ? path : rebuilt;
};
