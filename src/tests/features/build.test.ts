import { describe, expect, it } from "vitest";
import { unitPropertiesMap } from "shared/match-logic/game-constants/unit-properties";
import type { MainAction } from "shared/schemas/action";
import { createTestMatch, dispatchMainAction, tiles } from "../helpers/scenario";

describe("build feature", () => {
  it("builds a unit on an owned base, deducting its cost", () => {
    const match = createTestMatch({
      tiles: [[tiles.base(0)]],
      players: [{ slot: 0, hasCurrentTurn: true, funds: 10000 }, { slot: 1 }],
    });

    const action: MainAction = { type: "build", unitType: "infantry", position: [0, 0] };
    dispatchMainAction(match, action);

    const built = match.getUnit([0, 0]);
    expect(built?.data.type).toBe("infantry");
    // Freshly built units cannot act on the turn they were produced.
    expect(built?.data.isReady).toBe(false);
    expect(match.getPlayerBySlot(0)!.data.funds).toBe(10000 - unitPropertiesMap.infantry.cost);
  });

  it("rejects building without enough funds", () => {
    const match = createTestMatch({
      tiles: [[tiles.base(0)]],
      players: [{ slot: 0, hasCurrentTurn: true, funds: 0 }, { slot: 1 }],
    });

    const action: MainAction = { type: "build", unitType: "infantry", position: [0, 0] };
    expect(() => dispatchMainAction(match, action)).toThrow();
  });
});
