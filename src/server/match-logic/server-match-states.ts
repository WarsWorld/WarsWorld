import { Player } from "@prisma/client";
import { WWMap } from "components/schemas/map";
import { Position } from "components/schemas/position";
import { PlayerSlot, willBeChangeableTile } from "components/schemas/tile";
import {
  Unit,
  unitInitialAmmoMap,
  unitInitialFuelMap,
} from "components/schemas/unit";
import { getPlayerAmountOfMap } from "server/routers/map";
import { WWEvent } from "types/core-game/event";

type Positioned = {
  position: Position;
};

type Ownable = {
  ownerSlot: PlayerSlot;
};

type CapturableTile = Positioned &
  Ownable & {
    type: "city" | "base" | "airport" | "harbor" | "lab" | "comtower" | "hq";
    hp: number;
  };

type LaunchableSiloTile = Positioned & {
  type: "unused-silo";
  fired: boolean;
};

export type ChangeableTiles = CapturableTile | LaunchableSiloTile;

interface PlayerInMatch {
  playerSlot: PlayerSlot;
  playerId: Player["id"];
  ready?: boolean;
}

interface MatchState {
  map: WWMap;
  changeableTiles: ChangeableTiles[];
  turn: number;
  numberOfPlayersRequiredToPlay: number;
  players: PlayerInMatch[];
}

/**
 * Maps matchIds to states
 */
const serverMatchStates = new Map<string, MatchState>();

const getChangeableTilesFromMap = (map: WWMap): ChangeableTiles[] => {
  const changeableTiles: ChangeableTiles[] = [];

  for (const y in map.tiles) {
    const row = map.tiles[y];

    for (const x in row) {
      const tile = row[x];

      if (willBeChangeableTile(tile)) {
        const position: Position = [
          Number.parseInt(x, 10),
          Number.parseInt(y, 10),
        ];

        changeableTiles.push(
          tile.type === "unused-silo"
            ? {
                type: tile.type,
                position,
                fired: false,
              }
            : {
                type: tile.type,
                position,
                hp: 20,
                ownerSlot: tile.playerSlot,
              },
        );
      }
    }
  }

  return changeableTiles;
};

export const startMatchState = (
  matchId: string,
  map: WWMap,
  firstPlayer: Player,
) => {
  if (serverMatchStates.has(matchId)) {
    throw new Error(
      `Match ${matchId} can't be started because it's already started`,
    );
  }

  serverMatchStates.set(matchId, {
    map,
    turn: 0,
    changeableTiles: getChangeableTilesFromMap(map),
    numberOfPlayersRequiredToPlay: getPlayerAmountOfMap(map),
    players: [
      {
        playerId: firstPlayer.id,
        ready: false,
        playerSlot: 0,
      },
    ],
  });

  return serverMatchStates.get(matchId);
};

export const getMatchState = (matchId: string) =>
  serverMatchStates.get(matchId);

// TODO
const getCurrentTurnPlayerSlot = (matchState: MatchState): PlayerSlot =>
  matchState.turn % matchState.numberOfPlayersRequiredToPlay;

export const applyEventToMatch = (matchId: string, event: WWEvent) => {
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
