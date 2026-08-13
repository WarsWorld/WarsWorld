import { describe, expect, it } from "vitest";
import {
  getCurrentTurnPlayer,
  getPlayerBySlot,
  getUnitAt,
  isCurrentTurnPlayer,
  isOutOfBounds,
  ownsSlot,
  samePosition,
  visualHP,
  type MatchPlayer,
  type MatchUnit,
  type MatchView,
} from "frontend/components/match/match-view";

// Minimal, plain match view — only the fields the helpers read. Cast because the full inferred
// wire type is large; these tests pin the presentation-lookup behavior, not the schema.
const view = (over: Partial<MatchView> = {}): MatchView =>
  ({
    map: { tiles: [[0, 0, 0]] }, // 3 wide (x: 0..2), 1 tall (y: 0)
    units: [],
    players: [],
    ...over,
  }) as unknown as MatchView;

const unit = (
  position: [number, number],
  stats: MatchUnit["stats"] = { hp: 55 } as MatchUnit["stats"],
) => ({ position, playerSlot: 0, stats }) as unknown as MatchUnit;

const player = (over: Partial<MatchPlayer>) =>
  ({ id: "p", slot: 0, ...over }) as unknown as MatchPlayer;

describe("match view helpers", () => {
  it("compares positions structurally", () => {
    expect(samePosition([1, 2], [1, 2])).toBe(true);
    expect(samePosition([1, 2], [2, 1])).toBe(false);
  });

  it("finds a unit by position", () => {
    const m = view({ units: [unit([1, 0]), unit([2, 0])] });
    expect(getUnitAt(m, [2, 0])).toBeDefined();
    expect(getUnitAt(m, [0, 0])).toBeUndefined();
  });

  it("detects out-of-bounds against the map dimensions", () => {
    const m = view();
    expect(isOutOfBounds(m, [0, 0])).toBe(false);
    expect(isOutOfBounds(m, [2, 0])).toBe(false);
    expect(isOutOfBounds(m, [3, 0])).toBe(true); // x past width
    expect(isOutOfBounds(m, [0, 1])).toBe(true); // y past height
    expect(isOutOfBounds(m, [-1, 0])).toBe(true);
  });

  it("resolves the current-turn player and slot ownership", () => {
    const m = view({
      players: [player({ id: "a", slot: 0 }), player({ id: "b", slot: 1, hasCurrentTurn: true })],
    });
    expect(getCurrentTurnPlayer(m)?.id).toBe("b");
    expect(isCurrentTurnPlayer(m, "b")).toBe(true);
    expect(isCurrentTurnPlayer(m, "a")).toBe(false);
    expect(getPlayerBySlot(m, 0)?.id).toBe("a");
    expect(ownsSlot(player({ slot: 1 }), 1)).toBe(true);
    expect(ownsSlot(player({ slot: 1 }), 0)).toBe(false);
  });

  it("computes visual HP and hides it for fog-hidden units", () => {
    expect(visualHP(unit([0, 0], { hp: 55 } as MatchUnit["stats"]))).toBe(6); // ceil(5.5)
    expect(visualHP(unit([0, 0], { hp: 100 } as MatchUnit["stats"]))).toBe(10);
    expect(visualHP(unit([0, 0], "hidden" as MatchUnit["stats"]))).toBeUndefined();
  });
});
