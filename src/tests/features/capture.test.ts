import { describe, expect, it } from "vitest";
import type { MainAction } from "shared/schemas/action";
import { createTestMatch, dispatchMainAction, property, tiles } from "../helpers/scenario";

// Stand on the property (path = start tile only) and use the capture ability.
const CAPTURE: MainAction = { type: "move", path: [[0, 0]], subAction: { type: "ability" } };
const PASS_TURN: MainAction = { type: "passTurn" };

// A unit is spent for the turn once it acts (even standing still), so continuing a capture means
// resuming it on a later turn. In these 2-player scenarios, two passes bring the turn back to
// slot 0 with its capturing unit readied and its capture progress preserved.
function endRoundBackToSlot0(match: ReturnType<typeof createTestMatch>): void {
  dispatchMainAction(match, PASS_TURN);
  dispatchMainAction(match, PASS_TURN);
}

describe("capture feature", () => {
  it("captures an enemy property over two turns, flipping ownership at zero points", () => {
    const match = createTestMatch({
      tiles: [[tiles.road()]],
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
      changeableTiles: [property("city", 1, [0, 0])],
    });
    const infantry = match.getPlayerBySlot(0)!.addUnwrappedUnit({
      type: "infantry",
      isReady: true,
      position: [0, 0],
      stats: { fuel: 99, hp: 100 },
    });

    // First tick: 20 - 10 (visual HP) = 10 points left, still enemy-owned.
    dispatchMainAction(match, CAPTURE);
    expect(infantry.data).toMatchObject({ currentCapturePoints: 10 });
    expect(match.getTile([0, 0])).toMatchObject({ playerSlot: 1 });

    endRoundBackToSlot0(match);

    // Second tick: 10 - 10 = 0, capture completes and ownership flips.
    dispatchMainAction(match, CAPTURE);
    expect(match.getTile([0, 0])).toMatchObject({ playerSlot: 0 });
  });

  it("captures more slowly at lower HP, removing points equal to the unit's visual HP", () => {
    const match = createTestMatch({
      tiles: [[tiles.road()]],
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
      changeableTiles: [property("city", 1, [0, 0])],
    });
    // 50 HP -> visual HP 5, so each tick removes only 5 capture points (4 ticks to flip).
    const infantry = match.getPlayerBySlot(0)!.addUnwrappedUnit({
      type: "infantry",
      isReady: true,
      position: [0, 0],
      stats: { fuel: 99, hp: 50 },
    });

    dispatchMainAction(match, CAPTURE);
    expect(infantry.data).toMatchObject({ currentCapturePoints: 15 }); // 20 - 5
    expect(match.getTile([0, 0])).toMatchObject({ playerSlot: 1 });
    endRoundBackToSlot0(match);

    dispatchMainAction(match, CAPTURE);
    expect(infantry.data).toMatchObject({ currentCapturePoints: 10 }); // 15 - 5
    expect(match.getTile([0, 0])).toMatchObject({ playerSlot: 1 });
    endRoundBackToSlot0(match);

    dispatchMainAction(match, CAPTURE);
    expect(infantry.data).toMatchObject({ currentCapturePoints: 5 }); // 10 - 5
    expect(match.getTile([0, 0])).toMatchObject({ playerSlot: 1 });
    endRoundBackToSlot0(match);

    // Fourth tick: 5 - 5 = 0, capture finally completes.
    dispatchMainAction(match, CAPTURE);
    expect(match.getTile([0, 0])).toMatchObject({ playerSlot: 0 });
  });

  it("eliminates the owner and transfers their properties when their HQ is captured", () => {
    const match = createTestMatch({
      tiles: [[tiles.road(), tiles.road(), tiles.road()]],
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
      changeableTiles: [property("hq", 1, [0, 0]), property("city", 1, [1, 0])],
    });
    const p1 = match.getPlayerBySlot(1)!;
    match.getPlayerBySlot(0)!.addUnwrappedUnit({
      type: "infantry",
      isReady: true,
      position: [0, 0],
      stats: { fuel: 99, hp: 100 },
    });
    // An enemy unit that should be wiped when its owner is eliminated.
    p1.addUnwrappedUnit({
      type: "infantry",
      isReady: true,
      position: [2, 0],
      stats: { fuel: 99, hp: 100 },
    });

    // Two ticks (one per turn) to bring the HQ to zero capture points.
    dispatchMainAction(match, CAPTURE);
    endRoundBackToSlot0(match);
    dispatchMainAction(match, CAPTURE);

    expect(p1.data.status).toBe("captured");
    expect(match.getUnit([2, 0])).toBeUndefined(); // eliminated player's units removed
    expect(match.getTile([0, 0])).toMatchObject({ playerSlot: 0 }); // HQ
    expect(match.getTile([1, 0])).toMatchObject({ playerSlot: 0 }); // city transferred too
  });
});
