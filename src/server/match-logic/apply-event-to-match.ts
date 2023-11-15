import { BuildEvent, WWEvent } from "../../shared/types/events";
import { PlayerSlot } from "../schemas/player-slot";
import { unitTypeIsUnitWithAmmo, WWUnit } from "../schemas/unit";
import { unitPropertiesMap } from "../../shared/match-logic/buildable-unit";
import { serverMatchStates } from "./server-match-states";
import {
  addDirection,
  getDistance,
  getUnitAtPosition,
} from "../../shared/match-logic/positions";
import { isSamePosition, Position } from "../schemas/position";
import { PlayerInMatch } from "../../shared/types/server-match-state";
import { BuildAction } from "../schemas/action";
import { allDirections, directionSchema } from "../schemas/direction";

const createNewUnitFromBuildEvent = (
  event: BuildAction,
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
          loadedUnit: null,
          loadedUnit2: null,
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
        loadedUnit: null,
        loadedUnit2: null,
      };
  }
};
const loadedUnitToWWUnit = (
  loadedUnit: any,
  playerSlot: number,
  position: Position
): WWUnit => {
  return {
    ...loadedUnit,
    isReady: false,
    playerSlot: playerSlot,
    position: position,
  };
};

export const applyMainEventToMatch = (
  matchId: string,
  currentPlayer: PlayerInMatch,
  event: WWEvent
) => {
  const match = serverMatchStates.get(matchId);
  if (match === undefined) {
    throw new Error(`Match ${matchId} not found in server state`);
  }

  switch (event.type) {
    case "build": {
      match.units.push(createNewUnitFromBuildEvent(event, currentPlayer.slot));
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
  currentPlayer: PlayerInMatch,
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
      const attacker = getUnitAtPosition(match, fromPosition);
      const defender = getUnitAtPosition(match, event.defenderPosition);
      if (attacker === null || defender === null)
        throw new Error("This should never happen");
      if (
        event.defenderHP === 0 //kill unit
      );
      else defender.stats.hp = event.defenderHP;
      if (event.attackerHP !== undefined) {
        if (
          event.attackerHP === 0 //kill unit
        );
        else attacker.stats.hp = event.attackerHP;
      }
      break;
    case "ability": {
      switch (unit.type) {
        case "infantry":
        case "mech":
          //capture, with hooks
          break;
        case "apc":
          //supply
          for (const dir of allDirections) {
            const suppliedUnit = getUnitAtPosition(
              match,
              addDirection(fromPosition, dir)
            );
            if (suppliedUnit !== null)
              suppliedUnit.stats.fuel =
                unitPropertiesMap[suppliedUnit.type].initialFuel;
          }
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
          //toggle hide
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
          if (event.unloads[0].isSecondUnit && "loadedUnit2" in unit) {
            match.units.push(
              loadedUnitToWWUnit(
                unit.loadedUnit2,
                unit.playerSlot,
                addDirection(fromPosition, event.unloads[0].direction)
              )
            );
            unit.loadedUnit2 = null;
          } else if (!event.unloads[0].isSecondUnit && "loadedUnit" in unit) {
            match.units.push(
              loadedUnitToWWUnit(
                unit.loadedUnit,
                unit.playerSlot,
                addDirection(fromPosition, event.unloads[0].direction)
              )
            );
            if ("loadedUnit2" in unit) {
              unit.loadedUnit = unit.loadedUnit2;
              unit.loadedUnit2 = null;
            } else unit.loadedUnit = null;
          }
          break;
        case 2:
          //unload all. unloads[0] refers to 1st unit, unloads[1] refers to 2nd unit
          if ("loadedUnit" in unit && "loadedUnit2" in unit) {
            match.units.push(
              loadedUnitToWWUnit(
                unit.loadedUnit,
                unit.playerSlot,
                addDirection(fromPosition, event.unloads[0].direction)
              )
            );
            match.units.push(
              loadedUnitToWWUnit(
                unit.loadedUnit2,
                unit.playerSlot,
                addDirection(fromPosition, event.unloads[1].direction)
              )
            );
            unit.loadedUnit = null;
            unit.loadedUnit2 = null;
          }
          break;
        default:
          break;
      }
      break;
    }
    case "repair": {
      const repairedUnit = getUnitAtPosition(
        match,
        addDirection(fromPosition, event.direction)
      );
      if (repairedUnit === null) throw new Error("This should never happen");

      repairedUnit.stats.fuel =
        unitPropertiesMap[repairedUnit.type].initialFuel;
      if (repairedUnit.stats.hp >= 90) repairedUnit.stats.hp = 99;
      else {
        const { cost } = unitPropertiesMap[repairedUnit.type];
        // TODO hook: cost and facility modifiers based on powers etc.
        if (cost * 0.1 <= currentPlayer.funds) {
          repairedUnit.stats.hp += 10;
          currentPlayer.funds -= cost * 0.1;
        }
      }
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
