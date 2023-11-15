import { BuildAction } from "server/schemas/action";
import { PlayerSlot } from "server/schemas/player-slot";
import { WWUnit, unitTypeIsUnitWithAmmo } from "server/schemas/unit";
import { prisma } from "server/prisma/prisma-client";
import { unitPropertiesMap } from "shared/match-logic/buildable-unit";
import { EmittableEvent } from "shared/types/events";
import {
  BackendMatchState,
  getCurrentTurnPlayer,
} from "shared/types/server-match-state";
import { getChangeableTilesFromMap } from "../../shared/match-logic/get-changeable-tile-from-map";
import { LeagueType } from "@prisma/client";

/**
 * Maps matchIds to states
 */
export const serverMatchStates = new Map<string, BackendMatchState>();

export const rebuildServerState = async () => {
  console.log("Rebuilding server state...");

  const matches = await prisma.match.findMany({
    where: {
      status: {
        not: "finished",
      },
    },
    include: {
      map: true,
      Event: true,
    },
  });

  matches.forEach((match) => {
    const initialChangeableTiles = getChangeableTilesFromMap(match.map);

    serverMatchStates.set(match.id, {
      id: match.id,
      changeableTiles: [],
      map: match.map,
      rules: {
        leagueType: LeagueType.standard,
      },
      players: match.playerState,
      status: match.status,
      turn: 0,
      units: [],
      currentWeather: "clear",
      weatherNextDay: null,
    });

    // TODO apply all events to serverMatchState
  });

  console.log("Rebuilding server state done.");
};

export const getMatchesOfPlayer = (playerId: string) =>
  [...serverMatchStates.values()].filter((match) =>
    match.players.find((e) => e.playerId === playerId)
  );

export const getMatches = () => [...serverMatchStates.values()];

export const getMatchState = (matchId: string) => {
  const match = serverMatchStates.get(matchId);

  if (match === undefined) {
    throw new Error("Match not found!");
  }

  return match;
};
