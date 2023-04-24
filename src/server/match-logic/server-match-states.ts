import { WWMap } from "components/schemas/map";
import { PlayerSlot } from "components/schemas/tile";
import {
  Unit,
  unitInitialAmmoMap,
  unitInitialFuelMap,
} from "components/schemas/unit";
import { WWEvent } from "types/core-game/event";

type MatchState = {
  map: WWMap;
  properties: unknown[];
  turn: number;
  // TODO
};

/**
 * Maps matchIds to states
 */
const serverMatchStates = new Map<string, MatchState>();

export const startMatchState = (matchId: string, map: WWMap) => {
  if (serverMatchStates.has(matchId)) {
    throw new Error(
      `Match ${matchId} can't be started because it's already started`,
    );
  }

  serverMatchStates.set(matchId, {
    map,
    turn: 0,
    properties: [],
  });

  return serverMatchStates.get(matchId);
};

export const getMatchState = (matchId: string) =>
  serverMatchStates.get(matchId);

// TODO
const getCurrentTurnPlayerSlot = (matchState: MatchState): PlayerSlot => 0;

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

      match.map.initialTiles[event.position[0]][event.position[1]].unit = unit;
    }
  }
};
