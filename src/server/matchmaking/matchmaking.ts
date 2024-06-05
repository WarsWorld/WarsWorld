import type { Player } from "@prisma/client";

// Automatic queues will only have 1v1 settings (for now)

type PlayerInQueue = {
  player: Player;
  minutesQueued: number;
}; // more info can be added, but most of it should be on the player type itself

/**
 * Gets 2 players in queue and returns true if they can be paired
 * togerther for a match.
 */
type MatchmakingFunction = (player1: PlayerInQueue, player2: PlayerInQueue) => boolean;

type MatchmakingQueue = {
  queueId: string; //?
  matchmakingFunction: MatchmakingFunction;
  playersInQueue: PlayerInQueue[];
};

// this pairing function can be improved a lot, but it will work fine
// for a small amount of players
export const createMatchmakingPairs = (matchmakingQueue: MatchmakingQueue) => {
  const playerPairs: [PlayerInQueue, PlayerInQueue][] = [];
  const { matchmakingFunction, playersInQueue } = matchmakingQueue;

  for (let i = 0; i < playersInQueue.length; ++i) {
    for (let j = i + 1; j < playersInQueue.length; ++j) {
      const player1 = playersInQueue[i];
      const player2 = playersInQueue[j];

      if (matchmakingFunction(player1, player2)) {
        //if 2 players can be paired together
        playerPairs.push([player1, player2]);

        playersInQueue.splice(j, 1);
        playersInQueue.splice(i, 1);
        --i;
        break; //only pair with one other player
      }
    }
  }

  return playerPairs;
};

export const createPossibleMatches = (matchmakingQueue: MatchmakingQueue) => {
  const playerPairs = createMatchmakingPairs(matchmakingQueue);

  for (const playerPair of playerPairs) {
    //decide a map, tier, ruleset in general and create a match
    //(+ notify players in some way)
  }
};

export const defaultMatchmakingFunction = (player1: PlayerInQueue, player2: PlayerInQueue) => {
  //arbitrary constants
  const eloRange = 100,
    eloRangeIncPerMinute = 10;

  const player1EloRange = eloRange + player1.minutesQueued * eloRangeIncPerMinute;
  const player2EloRange = eloRange + player2.minutesQueued * eloRangeIncPerMinute;

  if (true) {
    /*if abs(player1.certainQueue.elo - player2.etc) < min(p1eloRange, p2eloRange)*/
    return true;
  }

  return false;
};
