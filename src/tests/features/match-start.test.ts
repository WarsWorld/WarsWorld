import { describe, expect, it } from "vitest";
import { applyMainEventToMatch } from "shared/match-logic/events/apply-event-to-match";
import { createMatchStartEvent } from "shared/match-logic/events/handlers/match-start";
import { createTestMatch, property, tiles } from "../helpers/scenario";

describe("match start", () => {
  it("grants the starting player their first-turn income and leaves others at zero", () => {
    const match = createTestMatch({
      tiles: [[tiles.road(), tiles.road(), tiles.road()]],
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
      // slot 0 owns two funds-giving properties; slot 1 owns one.
      changeableTiles: [
        property("city", 0, [0, 0]),
        property("hq", 0, [1, 0]),
        property("city", 1, [2, 0]),
      ],
    });
    const p0 = match.getPlayerBySlot(0)!;
    const p1 = match.getPlayerBySlot(1)!;

    expect(p0.data.funds).toBe(0);
    expect(p0.getFundsPerTurn()).toBe(2000); // 2 properties * 1000 fundsPerProperty

    applyMainEventToMatch(match, createMatchStartEvent(match));

    // Only the starting player collects income on day 1; the rest wait for their own turn.
    expect(p0.data.funds).toBe(2000);
    expect(p1.data.funds).toBe(0);
  });

  it("re-deriving state by replaying the matchStart event grants income exactly once", () => {
    const match = createTestMatch({
      tiles: [[tiles.road()]],
      players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
      changeableTiles: [property("city", 0, [0, 0])],
    });
    const p0 = match.getPlayerBySlot(0)!;
    const event = createMatchStartEvent(match);

    // A rebuild replays the stored event on top of the zero-funds snapshot: income lands once.
    applyMainEventToMatch(match, event);

    expect(p0.data.funds).toBe(1000);
  });
});
