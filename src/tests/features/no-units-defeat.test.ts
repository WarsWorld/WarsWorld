import { describe, expect, it } from "vitest";
import type { MainAction } from "shared/schemas/action";
import { createTestMatch, dispatchMainAction, tiles } from "../helpers/scenario";

const PASS_TURN: MainAction = { type: "passTurn" };

/**
 * "No units left" defeat rule (see the design note): losing all your units is NOT an instant loss —
 * it's resolved at a turn boundary, and only once you've PRODUCED a unit (built one; predeployed /
 * starting units don't count). Before your first build, an empty board is the round-one grace period,
 * not a defeat. Applied in `applyPassTurnEvent` so it survives event-log replay.
 */
describe("no-units defeat (turn-boundary, gated on having produced a unit)", () => {
  it("routes a player who ends their turn with no units after producing one", () => {
    const match = createTestMatch({
      tiles: [[tiles.road(), tiles.road()]],
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
    });
    const p0 = match.getPlayerBySlot(0)!;
    // Keep slot 1 alive so the game continues (and getNextAlivePlayer has somewhere to go).
    match.getPlayerBySlot(1)!.addUnwrappedUnit({
      type: "infantry",
      isReady: true,
      position: [1, 0],
      stats: { fuel: 99, hp: 100 },
    });

    // p0 built a unit earlier this game but now has none left (deleted / lost, no rebuild this turn).
    p0.data.hasBuiltUnit = true;
    expect(p0.getUnits()).toHaveLength(0);

    dispatchMainAction(match, PASS_TURN);

    expect(p0.data.status).toBe("routed");
  });

  it("does NOT route a player with no units who never produced one (round-one grace)", () => {
    const match = createTestMatch({
      tiles: [[tiles.road(), tiles.road()]],
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
    });
    const p0 = match.getPlayerBySlot(0)!;
    match.getPlayerBySlot(1)!.addUnwrappedUnit({
      type: "infantry",
      isReady: true,
      position: [1, 0],
      stats: { fuel: 99, hp: 100 },
    });

    // Never built anything -> hasBuiltUnit is falsy -> empty board is not a loss yet.
    expect(p0.data.hasBuiltUnit).toBeUndefined();

    dispatchMainAction(match, PASS_TURN);

    expect(p0.data.status).toBe("alive");
  });

  it("does NOT route a player who still has a unit at turn end", () => {
    const match = createTestMatch({
      tiles: [[tiles.road(), tiles.road()]],
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
    });
    const p0 = match.getPlayerBySlot(0)!;
    p0.data.hasBuiltUnit = true;
    p0.addUnwrappedUnit({
      type: "infantry",
      isReady: true,
      position: [0, 0],
      stats: { fuel: 99, hp: 100 },
    });
    match.getPlayerBySlot(1)!.addUnwrappedUnit({
      type: "infantry",
      isReady: true,
      position: [1, 0],
      stats: { fuel: 99, hp: 100 },
    });

    dispatchMainAction(match, PASS_TURN);

    expect(p0.data.status).toBe("alive");
  });
});
