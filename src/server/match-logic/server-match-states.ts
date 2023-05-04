import { BuildAction } from "components/schemas/action";
import { PlayerSlot } from "components/schemas/player-slot";
import {
  UnitDuringMatch,
  unitTypeIsUnitWithAmmo,
} from "components/schemas/unit";
import { prisma } from "server/prisma/prisma-client";
import { unitPropertiesMap } from "types/core-game/buildable-unit";
import { EmittableEvent } from "types/core-game/events";
import { ServerMatchState } from "types/core-game/server-match-state";
import { getChangeableTilesFromMap } from "./get-changeable-tile-from-map";
import { LeagueType } from "@prisma/client";

/**
 * Maps matchIds to states
 */
export const serverMatchStates = new Map<string, ServerMatchState>();

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
    });
  });

  console.log("Rebuilding server state done.");
};

export const getMatchesOfPlayer = (playerId: string) =>
  [...serverMatchStates.values()].filter((match) =>
    match.players.find((e) => e.playerId === playerId),
  );

export const getMatches = () => [...serverMatchStates.values()];

export const getMatchState = (matchId: string) => {
  const match = serverMatchStates.get(matchId);

  if (match === undefined) {
    throw new Error("Match not found!");
  }

  return match;
};

const createNewUnitFromBuildAction = (
  event: BuildAction,
  playerSlot: PlayerSlot,
): UnitDuringMatch => {
  const { unitType } = event;

  const unitProperties = unitPropertiesMap[unitType];

  const partialUnit = {
    playerSlot,
    actionState: "waited",
    position: event.position,
    stats: {
      fuel: unitProperties.initialFuel,
      hp: 100,
    },
  } satisfies Partial<UnitDuringMatch>;

  if (unitTypeIsUnitWithAmmo(unitType)) {
    const ammo = unitPropertiesMap[unitType].initialAmmo;

    const partialUnitWithAmmo = {
      ...partialUnit,
      stats: {
        ...partialUnit.stats,
        ammo,
      },
    } satisfies Partial<UnitDuringMatch>;

    switch (unitType) {
      case "artillery":
      case "mech":
      case "tank":
      case "missile":
      case "rocket":
      case "mediumTank":
      case "neoTank":
      case "megaTank":
      case "battleCopter":
      case "bomber":
      case "fighter":
      case "battleship":
      case "pipeRunner":
      case "antiAir":
        return {
          type: unitType,
          ...partialUnitWithAmmo,
        };
      case "stealth":
      case "sub":
        return {
          type: unitType,
          ...partialUnitWithAmmo,
          hidden: false,
        };
      case "carrier":
      case "cruiser":
        return {
          type: unitType,
          ...partialUnitWithAmmo,
          loadedUnits: [],
        };
    }
  }

  switch (unitType) {
    case "infantry":
    case "recon":
    case "blackBomb":
      return {
        type: unitType,
        ...partialUnit,
      };
    case "apc":
    case "transportCopter":
      return {
        type: unitType,
        ...partialUnit,
        loadedUnit: null,
      };
    case "blackBoat":
    case "lander":
      return {
        type: unitType,
        ...partialUnit,
        loadedUnits: [],
      };
  }
};

export const applyEventToMatch = (matchId: string, event: EmittableEvent) => {
  const match = serverMatchStates.get(matchId);

  if (match === undefined) {
    throw new Error(`Match ${matchId} not found in server state`);
  }

  switch (event.type) {
    case "build": {
      const currentPlayerSlot = match.players.find(
        (p) => p.hasCurrentTurn,
      )?.playerSlot;

      if (currentPlayerSlot === undefined) {
        throw new Error("TODO?");
      }

      const unit = createNewUnitFromBuildAction(event, currentPlayerSlot);
      match.map.tiles[event.position[0]][event.position[1]].unit = unit;
    }
  }
};
