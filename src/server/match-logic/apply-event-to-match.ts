import { BuildEvent, WWEvent } from "../../shared/types/events";
import { PlayerSlot } from "../schemas/player-slot";
import { unitTypeIsUnitWithAmmo, WWUnit } from "../schemas/unit";
import { unitPropertiesMap } from "../../shared/match-logic/buildable-unit";
import { serverMatchStates } from "./server-match-states";
import {
  getDistance,
  getUnitAtPosition,
} from "../../shared/match-logic/positions";
import { isSamePosition, Position } from "../schemas/position";

const createNewUnitFromBuildEvent = (
  event: BuildEvent,
  playerSlot: PlayerSlot
): WWUnit => {
  const { unitType } = event;

  const unitProperties = unitPropertiesMap[unitType];

  const partialUnit = {
    playerSlot,
    position: event.position,
    stats: {
      fuel: unitProperties.initialFuel,
      hp: 100,
    },
    isReady: true,
  } satisfies Partial<WWUnit>;

  if (unitTypeIsUnitWithAmmo(unitType)) {
    const ammo = unitPropertiesMap[unitType].initialAmmo;

    const partialUnitWithAmmo = {
      ...partialUnit,
      stats: {
        ...partialUnit.stats,
        ammo,
      },
    } satisfies Partial<WWUnit>;

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

export const applyMainEventToMatch = (
  matchId: string,
  currentPlayerSlot: PlayerSlot,
  event: WWEvent
) => {
  const match = serverMatchStates.get(matchId);
  if (match === undefined) {
    throw new Error(`Match ${matchId} not found in server state`);
  }

  switch (event.type) {
    case "build": {
      match.units.push(createNewUnitFromBuildEvent(event, currentPlayerSlot));
      break;
    }
    case "move": {
      const unit = getUnitAtPosition(match, event.path[0]);
      if (unit === null) throw new Error("This should never happen");
      unit.position = event.path[event.path.length - 1];
      //TODO: does fuel consumption need hooks?
      unit.stats.fuel -= event.path.length - 1;
      break;
    }

    default:
      throw new Error("Received an event that is not a main event");
  }
};

export const applySubEventToMatch = (
  matchId: string,
  currentPlayerSlot: PlayerSlot,
  event: WWEvent,
  fromPosition: Position
) => {
  const match = serverMatchStates.get(matchId);
  if (match === undefined) {
    throw new Error(`Match ${matchId} not found in server state`);
  }

  const unit = getUnitAtPosition(match, fromPosition);
  if (unit === null) throw new Error("This should never happen");

  switch (event.type) {
    case "wait":
      break;
    case "attack":
      //get both units, substract hp
      break;
    case "ability": {
      switch (unit.type) {
        case "infantry":
        case "mech":
          //capture
          break;
        case "apc":
          //supply
          break;
        case "blackBomb":
          //deal dmg
          for (const u of match.units) {
            if (getDistance(unit.position, u.position) <= 3)
              u.stats.hp = Math.max(1, u.stats.hp - 50);
          }
          //remove black bomb
          match.units = match.units.filter(
            (u) => !isSamePosition(u.position, unit.position)
          );
          break;
        case "stealth":
        case "sub":
          if ("hidden" in unit) unit.hidden = !unit.hidden;
          break;
        default:
          break;
      }
      break;
    }
    case "unload1": {
      switch (event.unloads.length) {
        case 1:
          //get unload index, unload
          break;
        case 2:
          //unload all
          break;
        default:
          break;
      }
      break;
    }
    case "repair": {
      //get repair unit, calc cost, determine if enough stonks for repair, repair
      break;
    }
    case "launchMissile": {
      for (const u of match.units) {
        if (getDistance(event.targetPosition, u.position) <= 3)
          u.stats.hp = Math.max(1, u.stats.hp - 30);
      }
      break;
    }
    
  }
  unit.isReady = false;
};
