import { describe, expect, it } from "vitest";
import type { BoardPosition } from "frontend/components/match/match-view";
import { updateTracedPath } from "frontend/components/match/path-planning";
import type { SnapshotUnit } from "frontend/components/match/turn-snapshot-view";

// updateTracedPath only reads reachableTiles (position/parent/cost) and movementPoints, so cast a
// minimal fixture past the full inferred SnapshotUnit type.
const unit = (movementPoints = 3): SnapshotUnit =>
  ({
    reachableTiles: [
      { position: [0, 0], parent: null, cost: 0 },
      { position: [1, 0], parent: [0, 0], cost: 1 },
      { position: [0, 1], parent: [0, 0], cost: 1 },
      { position: [1, 1], parent: [0, 1], cost: 1 }, // shortest to [1,1] goes via [0,1]
      { position: [2, 1], parent: [1, 1], cost: 1 },
    ],
    movementPoints,
  }) as unknown as SnapshotUnit;

describe("traced path (AW cursor routing)", () => {
  it("follows the cursor's exact route, not just the shortest path", () => {
    let path: BoardPosition[] = [[0, 0]];
    path = updateTracedPath(unit(), path, [1, 0]); // step right
    path = updateTracedPath(unit(), path, [1, 1]); // step down — routed via [1,0]

    // NOT the shortest path (which would go [0,0] -> [0,1] -> [1,1]).
    expect(path).toEqual([
      [0, 0],
      [1, 0],
      [1, 1],
    ]);
  });

  it("truncates when the cursor backtracks onto an earlier tile", () => {
    const path: BoardPosition[] = [
      [0, 0],
      [1, 0],
      [1, 1],
    ];
    expect(updateTracedPath(unit(), path, [1, 0])).toEqual([
      [0, 0],
      [1, 0],
    ]);
  });

  it("recomputes the shortest path when the cursor jumps to a non-adjacent tile", () => {
    const path: BoardPosition[] = [
      [0, 0],
      [1, 0],
    ];
    // [0,1] isn't adjacent to the trace's end [1,0], so rebuild via parent pointers.
    expect(updateTracedPath(unit(), path, [0, 1])).toEqual([
      [0, 0],
      [0, 1],
    ]);
  });

  it("ignores a hover onto an unreachable tile", () => {
    const path: BoardPosition[] = [
      [0, 0],
      [1, 0],
    ];
    expect(updateTracedPath(unit(), path, [5, 5])).toEqual(path);
  });
});
