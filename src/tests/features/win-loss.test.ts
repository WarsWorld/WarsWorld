import { describe, expect, it } from "vitest";
import type { MainAction } from "shared/schemas/action";
import { createTestMatch, dispatchMainAction, property, tiles } from "../helpers/scenario";

const ATTACK_ADJACENT: MainAction = {
  type: "move",
  path: [[0, 0]],
  subAction: { type: "attack", defenderPosition: [1, 0] },
};
const CAPTURE: MainAction = { type: "move", path: [[0, 0]], subAction: { type: "ability" } };
const PASS_TURN: MainAction = { type: "passTurn" };

// A unit is spent for the turn once it acts (even a stand-still capture), so a multi-tick capture
// spans multiple turns. In these 2-player scenarios, two passes return the turn to slot 0 with its
// capturing unit readied and its capture progress preserved.
function endRoundBackToSlot0(match: ReturnType<typeof createTestMatch>): void {
  dispatchMainAction(match, PASS_TURN);
  dispatchMainAction(match, PASS_TURN);
}

/**
 * Win/loss conditions.
 *
 * The engine currently only *computes* an `eliminationReason` for attacks and the property goal —
 * it does not yet APPLY them (no player is routed, no match ends). HQ/labs capture is the one
 * exception (see capture.test.ts). So:
 *  - the passing tests lock what IS implemented (unit removal + reason detection);
 *  - the `it.skip` tests are PENDING SPECS of the intended behavior (player routed, match
 *    finished). They currently fail — drop `.skip` when you implement match-end handling.
 */
describe("win/loss conditions", () => {
  it("removes a defender's last unit on a lethal attack and flags the elimination reason", () => {
    const match = createTestMatch({
      tiles: [[tiles.road(), tiles.road()]],
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
    });
    match.getPlayerBySlot(0)!.addUnwrappedUnit({
      type: "infantry",
      isReady: true,
      position: [0, 0],
      stats: { fuel: 99, hp: 100 },
    });
    const p1 = match.getPlayerBySlot(1)!;
    p1.addUnwrappedUnit({
      type: "infantry",
      isReady: true,
      position: [1, 0],
      stats: { fuel: 99, hp: 10 },
    });

    const event = dispatchMainAction(match, ATTACK_ADJACENT, { luck: 0 });

    expect(match.getUnit([1, 0])).toBeUndefined();
    expect(p1.getUnits()).toHaveLength(0);
    expect(event).toMatchObject({
      subEvent: { eliminationReason: "all-defender-units-destroyed" },
    });
  });

  it("removes an attacker's last unit when it dies to the counterattack", () => {
    const match = createTestMatch({
      tiles: [[tiles.road(), tiles.road()]],
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
    });
    match.getPlayerBySlot(0)!.addUnwrappedUnit({
      type: "infantry",
      isReady: true,
      position: [0, 0],
      stats: { fuel: 99, hp: 10 },
    });
    match.getPlayerBySlot(1)!.addUnwrappedUnit({
      type: "infantry",
      isReady: true,
      position: [1, 0],
      stats: { fuel: 99, hp: 100 },
    });

    const event = dispatchMainAction(match, ATTACK_ADJACENT, { luck: 0 });

    expect(match.getUnit([0, 0])).toBeUndefined();
    expect(event).toMatchObject({
      subEvent: { eliminationReason: "all-attacker-units-destroyed" },
    });
  });

  it("flags property-goal-reached when a capture brings the owner to the capture limit", () => {
    const match = createTestMatch({
      tiles: [[tiles.road(), tiles.road()]],
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
      changeableTiles: [property("city", 0, [1, 0]), property("city", 1, [0, 0])],
      rules: { captureLimit: 2 },
    });
    match.getPlayerBySlot(0)!.addUnwrappedUnit({
      type: "infantry",
      isReady: true,
      position: [0, 0],
      stats: { fuel: 99, hp: 100 },
    });

    dispatchMainAction(match, CAPTURE); // 20 -> 10
    endRoundBackToSlot0(match);
    const event = dispatchMainAction(match, CAPTURE); // completes: owned 1 + 1 >= captureLimit 2

    expect(event).toMatchObject({ subEvent: { eliminationReason: "property-goal-reached" } });
    expect(match.getTile([0, 0])).toMatchObject({ playerSlot: 0 });
  });

  // ── PENDING SPECS: match-end handling is not implemented yet. These assert the intended
  //    behavior and currently FAIL. Remove `.skip` as each is implemented. ──────────────────

  it.skip("routes a player who loses their last unit and ends the 1v1 match", () => {
    const match = createTestMatch({
      tiles: [[tiles.road(), tiles.road()]],
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
    });
    match.getPlayerBySlot(0)!.addUnwrappedUnit({
      type: "infantry",
      isReady: true,
      position: [0, 0],
      stats: { fuel: 99, hp: 100 },
    });
    const p1 = match.getPlayerBySlot(1)!;
    p1.addUnwrappedUnit({
      type: "infantry",
      isReady: true,
      position: [1, 0],
      stats: { fuel: 99, hp: 10 },
    });

    dispatchMainAction(match, ATTACK_ADJACENT, { luck: 0 });

    // Desired: losing your last unit routs you...
    expect(p1.data.status).toBe("routed");
    // ...and with one team left, the match is over.
    expect(match.status).toBe("finished");
  });

  it.skip("ends the match when a player reaches the capture limit", () => {
    const match = createTestMatch({
      tiles: [[tiles.road(), tiles.road()]],
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
      changeableTiles: [property("city", 0, [1, 0]), property("city", 1, [0, 0])],
      rules: { captureLimit: 2 },
    });
    match.getPlayerBySlot(0)!.addUnwrappedUnit({
      type: "infantry",
      isReady: true,
      position: [0, 0],
      stats: { fuel: 99, hp: 100 },
    });

    dispatchMainAction(match, CAPTURE);
    endRoundBackToSlot0(match);
    dispatchMainAction(match, CAPTURE);

    // Desired: reaching the capture limit wins the game.
    expect(match.status).toBe("finished");
  });
});
