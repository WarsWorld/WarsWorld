import { describe, expect, it } from "vitest";
import { addUnit, createTestMatch, dispatchMainAction, tiles } from "../helpers/scenario";

const roadRow = (length: number) => [Array.from({ length }, () => tiles.road())];

/**
 * Regression coverage for CO power charging. The bug: `gainPowerCharge` SET the meter to the last
 * attack's delta (`powerMeter = min(value, max)`) instead of accumulating onto it, so the meter
 * never built up across attacks and powers never became available. Callers pass a per-attack delta.
 */
describe("CO power charge", () => {
  it("an attack raises the attacker's power meter above 0", () => {
    const match = createTestMatch({
      tiles: roadRow(2),
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
    });
    const attacker = addUnit(match.getPlayerBySlot(0)!, "tank", [0, 0]);
    addUnit(match.getPlayerBySlot(1)!, "tank", [1, 0]);

    // Attack in place: a move that stays put, with an attack sub-action against the adjacent enemy.
    dispatchMainAction(match, {
      type: "move",
      path: [attacker.data.position],
      subAction: { type: "attack", defenderPosition: [1, 0] },
    });

    expect(match.getPlayerBySlot(0)!.data.powerMeter).toBeGreaterThan(0);
  });

  it("accumulates charge across gains instead of overwriting", () => {
    const match = createTestMatch({
      tiles: roadRow(1),
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
    });
    const player = match.getPlayerBySlot(0)!;

    player.gainPowerCharge(1000);
    player.gainPowerCharge(1500);

    // Additive: the second gain builds on the first (2500), not replaces it (1500).
    expect(player.data.powerMeter).toBe(2500);
  });

  it("clamps the meter to its maximum", () => {
    const match = createTestMatch({
      tiles: roadRow(1),
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
    });
    const player = match.getPlayerBySlot(0)!;

    player.gainPowerCharge(Number.MAX_SAFE_INTEGER);

    expect(player.data.powerMeter).toBe(player.getMaxPowerMeter());
  });
});
