import type { PlayerInQueue } from "./matchmaking";

/**
 * Gets 2 players in queue and returns true if they can be paired
 * togerther for a match.
 */
export type MatchmakingFunction = (player1: PlayerInQueue, player2: PlayerInQueue) => boolean;

export const defaultMatchmakingFunction = (player1: PlayerInQueue, player2: PlayerInQueue) => {
  //arbitrary constants
  const eloRange = 100;
  const eloRangeIncPerMinute = 10;

  const minutesElapsedSince = (d: Date) => {
    return new Date().getTime() - d.getTime();
  };

  if (player1.bannedPairings.has(player2.playerId)) {
    const bannedUntil = player1.bannedPairings.get(player2.playerId);

    if (bannedUntil === undefined || minutesElapsedSince(bannedUntil) < 0) {
      return false;
    }
  }

  if (player2.bannedPairings.has(player1.playerId)) {
    const bannedUntil = player2.bannedPairings.get(player1.playerId);

    if (bannedUntil === undefined || minutesElapsedSince(bannedUntil) < 0) {
      return false;
    }
  }

  const player1EloRange =
    eloRange + minutesElapsedSince(player1.startedQueueing) * eloRangeIncPerMinute;
  const player2EloRange =
    eloRange + minutesElapsedSince(player2.startedQueueing) * eloRangeIncPerMinute;

  if (true) {
    /*if abs(player1.certainQueue.elo - player2.etc) < min(p1eloRange, p2eloRange)*/
    return true;
  }

  return false;
};
