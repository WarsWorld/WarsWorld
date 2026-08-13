import { describe, expect, it } from "vitest";
import type { MainAction } from "shared/schemas/action";
import { createTestMatch, dispatchMainAction, property, tiles } from "../helpers/scenario";

const PASS_TURN: MainAction = { type: "passTurn" };

describe("pass-turn feature", () => {
  it("hands the turn to the next player and readies the passing player's units", () => {
    const match = createTestMatch({
      tiles: [[tiles.road(), tiles.road()]],
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
    });
    const p0 = match.getPlayerBySlot(0)!;
    const p1 = match.getPlayerBySlot(1)!;
    const unit = p0.addUnwrappedUnit({
      type: "infantry",
      isReady: false,
      position: [0, 0],
      stats: { fuel: 99, hp: 100 },
    });

    dispatchMainAction(match, PASS_TURN);

    expect(p0.data.hasCurrentTurn).toBe(false);
    expect(p1.data.hasCurrentTurn).toBe(true);
    // The player who just ended their turn has their units readied for next time.
    expect(unit.data.isReady).toBe(true);
  });

  it("grants the incoming player their per-turn property income", () => {
    const match = createTestMatch({
      tiles: [[tiles.road(), tiles.road()]],
      players: [
        { slot: 0, hasCurrentTurn: true },
        { slot: 1, funds: 500 },
      ],
      changeableTiles: [property("city", 1, [0, 0]), property("hq", 1, [1, 0])],
    });
    const p1 = match.getPlayerBySlot(1)!;
    const income = p1.getFundsPerTurn();

    expect(income).toBe(2000); // 2 funds-giving properties * 1000 fundsPerProperty

    dispatchMainAction(match, PASS_TURN);

    expect(p1.data.funds).toBe(500 + income);
  });

  it("repairs, resupplies and heals a damaged unit on an owned property", () => {
    const match = createTestMatch({
      tiles: [[tiles.road()]],
      players: [
        { slot: 0, hasCurrentTurn: true },
        { slot: 1, funds: 10000 },
      ],
      changeableTiles: [property("base", 1, [0, 0])],
    });
    const p1 = match.getPlayerBySlot(1)!;
    const unit = p1.addUnwrappedUnit({
      type: "infantry",
      isReady: false,
      position: [0, 0],
      stats: { fuel: 20, hp: 50 },
    });

    dispatchMainAction(match, PASS_TURN);

    expect(unit.getVisualHP()).toBe(7); // healed 2 (5 -> 7)
    expect(unit.getFuel()).toBe(99); // resupplied to full
    // funds: +1000 income (owned base) - 200 repair (2 hp * 100/hp).
    expect(p1.data.funds).toBe(10000 + 1000 - 200);
  });

  it("drains fuel from an air unit that is not on a repair facility", () => {
    const match = createTestMatch({
      tiles: [[tiles.road(), tiles.road()]],
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
    });
    const heli = match.getPlayerBySlot(1)!.addUnwrappedUnit({
      type: "battleCopter",
      isReady: false,
      position: [0, 0],
      stats: { fuel: 50, hp: 100, ammo: 6 },
    });

    dispatchMainAction(match, PASS_TURN);

    // battleCopter burns 2 fuel/turn while off an airport.
    expect(heli.getFuel()).toBe(48);
  });
});
