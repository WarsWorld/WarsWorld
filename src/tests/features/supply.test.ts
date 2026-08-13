import { describe, expect, it } from "vitest";
import type { MainAction } from "shared/schemas/action";
import { addUnit, createTestMatch, dispatchMainAction, tiles } from "../helpers/scenario";

const APC_SUPPLY: MainAction = { type: "move", path: [[1, 0]], subAction: { type: "ability" } };

describe("APC supply feature", () => {
  it("resupplies fuel and ammo of adjacent units, but not units further away", () => {
    const match = createTestMatch({
      tiles: [[tiles.road(), tiles.road(), tiles.road(), tiles.road()]],
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
    });
    const p0 = match.getPlayerBySlot(0)!;
    addUnit(p0, "apc", [1, 0]);
    const neighbourInfantry = addUnit(p0, "infantry", [0, 0], { stats: { fuel: 10, hp: 100 } });
    const neighbourMech = addUnit(p0, "mech", [2, 0], { stats: { fuel: 10, hp: 100, ammo: 0 } });
    const farRecon = addUnit(p0, "recon", [3, 0], { stats: { fuel: 10, hp: 100 } });

    dispatchMainAction(match, APC_SUPPLY);

    expect(neighbourInfantry.getFuel()).toBe(99); // refuelled to full
    expect(neighbourMech.getAmmo()).toBeGreaterThan(0); // rearmed from 0
    expect(farRecon.getFuel()).toBe(10); // two tiles away — untouched
  });
});
