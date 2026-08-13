import type { MatchWrapper } from "server/engine/entities/match";
import { deriveGameOver } from "./game-over";

export type FinalizeResult = { winnerTeamIndex: number | null };

/**
 * If a playing match has become decided, flip it to "finished" in memory and stamp each player's
 * result. Pure state mutation — persistence (DB write, live emit) is the caller's job.
 *
 * Returns the outcome when it just transitioned to finished, or `null` when there's nothing to do
 * (still contested, or already finalized). Idempotent: a match already "finished" returns null.
 */
export const finalizeIfGameOver = (match: MatchWrapper): FinalizeResult | null => {
  if (match.status !== "playing") {
    return null;
  }

  const gameOver = deriveGameOver(match, undefined);

  if (gameOver === null) {
    return null;
  }

  const { winnerTeamIndex } = gameOver;

  match.status = "finished";

  for (const player of match.getAllPlayers()) {
    player.data.result =
      winnerTeamIndex === null ? "drawn" : player.team.index === winnerTeamIndex ? "won" : "lost";
  }

  return { winnerTeamIndex };
};
