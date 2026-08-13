import { describe, expect, it } from "vitest";
import { applyMoveEvent } from "shared/match-logic/events/handlers/move";
import type { MainAction } from "shared/schemas/action";
import { createTestMatch, dispatchMainAction, tiles } from "../helpers/scenario";

describe("move feature", () => {
  it("moves a unit along a path, draining fuel and marking it as waited", () => {
    const match = createTestMatch({
      tiles: [[tiles.road(), tiles.road(), tiles.road()]],
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
    });
    match.getPlayerBySlot(0)!.addUnwrappedUnit({
      type: "infantry",
      isReady: true,
      position: [0, 0],
      stats: { fuel: 99, hp: 100 },
    });

    const action: MainAction = {
      type: "move",
      path: [
        [0, 0],
        [1, 0],
        [2, 0],
      ],
      subAction: { type: "wait" },
    };
    dispatchMainAction(match, action);

    expect(match.getUnit([0, 0])).toBeUndefined();
    const moved = match.getUnit([2, 0]);
    expect(moved?.data.type).toBe("infantry");
    expect(moved?.data.isReady).toBe(false);
    // 2 tiles travelled, 1 fuel per tile in clear weather.
    expect(moved?.getFuel()).toBe(97);
  });

  it("rejects moving a unit that has already acted this turn", () => {
    const match = createTestMatch({
      tiles: [[tiles.road(), tiles.road()]],
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
    });
    match.getPlayerBySlot(0)!.addUnwrappedUnit({
      type: "infantry",
      isReady: false,
      position: [0, 0],
      stats: { fuel: 99, hp: 100 },
    });

    const action: MainAction = {
      type: "move",
      path: [
        [0, 0],
        [1, 0],
      ],
      subAction: { type: "wait" },
    };
    expect(() => dispatchMainAction(match, action)).toThrow();
  });

  it("skips a stale move event whose unit is gone instead of throwing (rebuild resilience)", () => {
    const match = createTestMatch({
      tiles: [[tiles.road(), tiles.road()]],
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
    });

    // Replaying the event log on boot can hit a stand-still event whose unit has since been
    // removed. Applying it must be a no-op, not throw — otherwise the whole server crashes on boot.
    expect(() =>
      applyMoveEvent(match, { type: "move", path: [[1, 0]], trap: false }),
    ).not.toThrow();
  });
});
