import { MatchStatus, Player, WWMap } from "@prisma/client";
import { CO } from "components/schemas/co";
import { PlayerSlot } from "components/schemas/player-slot";
import { Position } from "components/schemas/position";
import {
  Unit,
  unitInitialAmmoMap,
  unitInitialFuelMap,
} from "components/schemas/unit";
import { prisma } from "server/prisma/prisma-client";
import { EmittableEvent } from "types/core-game/event";

interface Positioned {
  position: Position;
}

interface Ownable {
  ownerSlot: PlayerSlot;
}

interface CapturableTile extends Positioned, Ownable {
  type: "city" | "base" | "airport" | "harbor" | "lab" | "comtower" | "hq";
  hp: number;
}

interface LaunchableSiloTile extends Positioned {
  type: "unused-silo";
  fired: boolean;
}

export type ChangeableTile = CapturableTile | LaunchableSiloTile;

export interface PlayerInMatch {
  playerSlot: PlayerSlot;
  playerId: Player["id"];
  ready?: boolean;
  co: CO;
}

export interface MatchState {
  id: string;
  rules: {
    fogOfWar?: boolean;
    fundsMultiplier?: number;
  };
  status: MatchStatus;
  map: WWMap;
  changeableTiles: ChangeableTile[];
  turn: number;
  players: PlayerInMatch[];
}

/**
 * Maps matchIds to states
 */
export const serverMatchStates = new Map<string, MatchState>();

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
    },
  });

  matches.forEach((match) => {
    serverMatchStates.set(match.id, {
      id: match.id,
      changeableTiles: [],
      map: match.map,
      rules: {},
      players: [],
      status: match.status,
      turn: 0,
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

// TODO
const getCurrentTurnPlayerSlot = (matchState: MatchState): PlayerSlot =>
  matchState.turn % matchState.map.numberOfPlayers;

export const applyEventToMatch = (matchId: string, event: EmittableEvent) => {
  const match = serverMatchStates.get(matchId);

  if (match === undefined) {
    throw new Error(`Match ${matchId} not found in server state`);
  }

  switch (event.type) {
    case "build": {
      const unit: Unit = {
        type: event.unitType,
        playerSlot: getCurrentTurnPlayerSlot(match),
        position: event.position,
        fuel: unitInitialFuelMap[event.unitType],
        hp: 100,
      };

      const ammo = unitInitialAmmoMap[event.unitType];

      if (ammo !== undefined) {
        unit.ammo = ammo;
      }

      match.map.tiles[event.position[0]][event.position[1]].unit = unit;
    }
  }
};
