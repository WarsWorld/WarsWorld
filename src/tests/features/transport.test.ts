import { describe, expect, it } from "vitest";
import type { MainAction } from "shared/schemas/action";
import { addUnit, createTestMatch, dispatchMainAction, tiles } from "../helpers/scenario";

const LOAD: MainAction = {
  type: "move",
  path: [
    [0, 0],
    [1, 0],
  ],
  subAction: { type: "wait" },
};

describe("transport (load/unload) feature", () => {
  it("loads an infantry into an adjacent APC by moving onto it", () => {
    const match = createTestMatch({
      tiles: [[tiles.road(), tiles.road()]],
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
    });
    const p0 = match.getPlayerBySlot(0)!;
    const apc = addUnit(p0, "apc", [1, 0], { stats: { fuel: 60, hp: 100 } });
    p0.addUnwrappedUnit({
      type: "infantry",
      isReady: true,
      position: [0, 0],
      stats: { fuel: 99, hp: 100 },
    });

    dispatchMainAction(match, LOAD);

    expect(match.getUnit([0, 0])).toBeUndefined(); // infantry left the board
    expect(match.getUnit([1, 0])?.data.type).toBe("apc");
    expect(apc.data).toMatchObject({ loadedUnit: { type: "infantry" } });
  });

  it("unloads a carried unit to an adjacent tile", () => {
    const match = createTestMatch({
      tiles: [[tiles.road(), tiles.road()]],
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
    });
    const p0 = match.getPlayerBySlot(0)!;
    const apc = addUnit(p0, "apc", [1, 0], { stats: { fuel: 60, hp: 100 } });
    p0.addUnwrappedUnit({
      type: "infantry",
      isReady: true,
      position: [0, 0],
      stats: { fuel: 99, hp: 100 },
    });

    dispatchMainAction(match, LOAD);

    // APC stays put and drops the infantry to the left ([0,0]).
    const unload: MainAction = {
      type: "move",
      path: [[1, 0]],
      subAction: { type: "unloadWait", unloads: [{ isSecondUnit: false, direction: "left" }] },
    };
    dispatchMainAction(match, unload);

    expect(apc.data).toMatchObject({ loadedUnit: null });
    expect(match.getUnit([0, 0])?.data.type).toBe("infantry");
  });
});
