import type { MatchWrapper } from "shared/wrappers/match";
import type { TeamWrapper } from "shared/wrappers/team";

/**
 * Derives the match outcome from the engine's elimination status. A team is out once none of its
 * players are still "alive" — the engine flips a player to "routed"/"captured" the moment they're
 * eliminated (last unit destroyed in combat, HQ captured, …). Keying off status is what separates
 * "all units DESTROYED" (you had units and lost them -> routed -> game over, even if you own a base)
 * from "haven't produced yet" (round one, still "alive" -> not a loss): the latter never triggers an
 * elimination event, so its status stays "alive".
 */

const teamInPlay = (team: TeamWrapper): boolean =>
  team.players.some((player) => player.data.status === "alive");

export type GameOver = { winnerTeamIndex: number | null; viewerWon: boolean };

/** Non-null once at most one team is still in play. `winnerTeamIndex` is null on a draw. */
export const deriveGameOver = (
  match: MatchWrapper,
  viewerTeam: TeamWrapper | undefined,
): GameOver | null => {
  if (match.status === "setup") {
    return null; // not started — no outcome yet
  }

  const teamsInPlay = match.teams.filter(teamInPlay);

  if (teamsInPlay.length > 1) {
    return null; // still contested
  }

  const winnerTeamIndex = teamsInPlay.length === 1 ? teamsInPlay[0].index : null;

  return {
    winnerTeamIndex,
    viewerWon:
      winnerTeamIndex !== null && viewerTeam !== undefined && viewerTeam.index === winnerTeamIndex,
  };
};
