import { finalizeIfGameOver } from "server/routers/match/finalize";
import { describe, expect, it } from "vitest";
import { createTestMatch, tiles } from "../helpers/scenario";

/**
 * `finalizeIfGameOver` turns the engine's elimination status into a persisted outcome: it flips a
 * decided "playing" match to "finished" and stamps each player's won/lost/drawn result. Elimination
 * status is set here directly (the engine applies it via combat/capture — covered elsewhere); these
 * tests lock the derivation, not how a player gets routed.
 */
const twoPlayerMatch = () => {
  const match = createTestMatch({
    tiles: [[tiles.road(), tiles.road()]],
    players: [{ slot: 0, hasCurrentTurn: true }, { slot: 1 }],
  });
  match.status = "playing";
  return match;
};

describe("finalizeIfGameOver", () => {
  it("returns null and leaves the match playing while both teams are alive", () => {
    const match = twoPlayerMatch();

    expect(finalizeIfGameOver(match)).toBeNull();
    expect(match.status).toBe("playing");
  });

  it("finalizes with a winner and stamps won/lost per team", () => {
    const match = twoPlayerMatch();
    match.getPlayerBySlot(0)!.data.status = "routed";

    const winnerTeamIndex = match.getPlayerBySlot(1)!.team.index;

    expect(finalizeIfGameOver(match)).toEqual({ winnerTeamIndex });
    expect(match.status).toBe("finished");
    expect(match.getPlayerBySlot(1)!.data.result).toBe("won");
    expect(match.getPlayerBySlot(0)!.data.result).toBe("lost");
  });

  it("finalizes a draw as 'drawn' for everyone when no team remains", () => {
    const match = twoPlayerMatch();
    match.getPlayerBySlot(0)!.data.status = "routed";
    match.getPlayerBySlot(1)!.data.status = "captured";

    expect(finalizeIfGameOver(match)).toEqual({ winnerTeamIndex: null });
    expect(match.getPlayerBySlot(0)!.data.result).toBe("drawn");
    expect(match.getPlayerBySlot(1)!.data.result).toBe("drawn");
  });

  it("is idempotent once the match is finished", () => {
    const match = twoPlayerMatch();
    match.getPlayerBySlot(0)!.data.status = "routed";

    finalizeIfGameOver(match);

    expect(finalizeIfGameOver(match)).toBeNull();
  });
});
