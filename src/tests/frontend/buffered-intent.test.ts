import { describe, expect, it } from "vitest";
import { intentArrows, phantomPositions } from "frontend/components/match/buffered-intent";
import type { ActionKind, QueuedAction } from "frontend/utils/action-queue";
import type { MainAction } from "shared/schemas/action";

let seq = 0;
const queued = (kind: ActionKind, action: MainAction): QueuedAction => ({
  clientId: `c${seq}`,
  seq: seq++,
  kind,
  action,
  status: "pending",
});

const move = (from: [number, number], to: [number, number]): MainAction => ({
  type: "move",
  path: [from, to],
  subAction: { type: "wait" },
});

describe("buffered intent geometry", () => {
  it("emits one arrow per travelling buffered move, tagged by kind", () => {
    const arrows = intentArrows([
      queued("move", move([0, 0], [2, 0])),
      queued("attack", {
        type: "move",
        path: [
          [1, 1],
          [1, 3],
        ],
        subAction: { type: "attack", defenderPosition: [1, 4] },
      }),
    ]);

    expect(arrows).toHaveLength(2);
    expect(arrows[0]).toEqual({
      path: [
        [0, 0],
        [2, 0],
      ],
      kind: "move",
    });
    expect(arrows[1].kind).toBe("attack");
    expect(arrows[1].path).toEqual([
      [1, 1],
      [1, 3],
    ]);
  });

  it("omits an arrow for a move that doesn't travel (single-tile path)", () => {
    expect(intentArrows([queued("capture", move([0, 0], [0, 0]))])).toHaveLength(0);
  });

  it("marks move destinations and built tiles as phantoms, deduped", () => {
    const phantoms = phantomPositions([
      queued("move", move([0, 0], [2, 0])),
      queued("production", { type: "build", unitType: "infantry", position: [5, 5] }),
      queued("move", move([9, 9], [2, 0])), // same destination as the first move
    ]);

    expect(phantoms).toContainEqual([2, 0]);
    expect(phantoms).toContainEqual([5, 5]);
    expect(phantoms).toHaveLength(2); // [2,0] not duplicated
  });
});
