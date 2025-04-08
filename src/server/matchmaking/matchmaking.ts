import type { LeagueType, Player } from "@prisma/client";
import { getRandomMapSetting } from "./mapList";
import type { MatchmakingFunction } from "./matchmakingFunctions";
import { defaultMatchmakingFunction } from "./matchmakingFunctions";
import { shuffleArray } from "./random";

// Automatic queues will only have 1v1 settings (for now)

//playerinqueue doesn't work since we can't lose info, make it a boolean (or set of playerId in queue)
export type PlayerInQueue = {
  playerId: Player["id"];
  startedQueueing: Date;
  /**
   * For each other player, until when they can't be paired (undefined means indefinetly)
   */
  bannedPairings: Map<Player["id"], Date | undefined>;
}; // more info can be added, but most of it should be on the player type itself

type MatchmakingQueue = {
  leagueType: LeagueType;
  matchmakingFunction: MatchmakingFunction;
  playersInQueue: Map<Player["id"], PlayerInQueue>;
  dropQueueAfterMatchStart: boolean;
};

//TODO add queues for live, with distinction
const currentQueues: Record<LeagueType, MatchmakingQueue> = {
  standard: {
    leagueType: "standard",
    matchmakingFunction: defaultMatchmakingFunction,
    playersInQueue: new Map(),
    dropQueueAfterMatchStart: true,
  },
  fog: {
    leagueType: "fog",
    matchmakingFunction: defaultMatchmakingFunction,
    playersInQueue: new Map(),
    dropQueueAfterMatchStart: true,
  },
  highFunds: {
    leagueType: "highFunds",
    matchmakingFunction: defaultMatchmakingFunction,
    playersInQueue: new Map(),
    dropQueueAfterMatchStart: true,
  },
  dualLeague: {
    leagueType: "dualLeague",
    matchmakingFunction: defaultMatchmakingFunction,
    playersInQueue: new Map(),
    dropQueueAfterMatchStart: true,
  },
  standardTeams: {
    leagueType: "standardTeams",
    matchmakingFunction: defaultMatchmakingFunction,
    playersInQueue: new Map(),
    dropQueueAfterMatchStart: true,
  },
  broken: {
    leagueType: "broken",
    matchmakingFunction: defaultMatchmakingFunction,
    playersInQueue: new Map(),
    dropQueueAfterMatchStart: true,
  },
};

// this pairing function can be improved a lot, but it will work fine
// for a small amount of players
export const createMatchmakingPairs = (matchmakingQueue: MatchmakingQueue) => {
  const playerPairs: [PlayerInQueue, PlayerInQueue][] = [];
  const { matchmakingFunction, playersInQueue } = matchmakingQueue;

  const shuffledPlayers = shuffleArray(Array.from(playersInQueue.values()));

  for (let i = 0; i < shuffledPlayers.length; ++i) {
    for (let j = i + 1; j < shuffledPlayers.length; ++j) {
      const player1 = shuffledPlayers[i];
      const player2 = shuffledPlayers[j];

      if (matchmakingFunction(player1, player2)) {
        //if 2 players can be paired together
        playerPairs.push([player1, player2]);

        playersInQueue.delete(player1.playerId);
        playersInQueue.delete(player2.playerId);
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
    const mapSetting = getRandomMapSetting(matchmakingQueue.leagueType);

    if (mapSetting === undefined) {
      throw new Error(
        "Did not find available map settings for the league: " + matchmakingQueue.leagueType,
      );
    }

    //create a match
    //asign random CO for each player and random army (or most used CO and most used army. keep in mind army can't be repeated)
    //notify players in some way (that a match was found)
  }
};

//----------------------------------------------
const nowAfterMinutes = (minutes: number): Date => {
  const result = new Date();
  result.setMinutes(result.getMinutes() + minutes);
  return result;
};

const onMatchStart = (leagueType: LeagueType, playerIds: string[]) => {
  //ban players from pairing each other for a "random" amount of time
  const banPairingMinutesBase = 1440; //1 day
  const banPairingMinutesDev = 1440;

  const matchmakingQueue = currentQueues[leagueType];

  for (const playerId1 of playerIds) {
    for (const playerId2 of playerIds) {
      if (playerId1 === playerId2) {
        continue;
      }

      const banPairingMinutes =
        banPairingMinutesBase + banPairingMinutesDev * (Math.random() * 2 - 1);

      matchmakingQueue.playersInQueue
        .get(playerId1)
        ?.bannedPairings.set(playerId2, nowAfterMinutes(banPairingMinutes));
      matchmakingQueue.playersInQueue
        .get(playerId2)
        ?.bannedPairings.set(playerId1, nowAfterMinutes(banPairingMinutes));
    }
  }
};
