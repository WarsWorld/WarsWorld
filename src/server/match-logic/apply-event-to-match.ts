import type { PlayerInMatchWrapper } from "shared/wrappers/player-in-match";
import { unitPropertiesMap } from "../../shared/match-logic/buildable-unit";
import { addDirection } from "../../shared/match-logic/positions";
import type { WWEvent } from "../../shared/types/events";
import type { BuildAction } from "../schemas/action";
import { allDirections } from "../schemas/direction";
import type { PlayerSlot } from "../schemas/player-slot";
import type { Position } from "../schemas/position";
import type { WWUnit } from "../schemas/unit";
import { matchStore } from "./match-store";

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

  if ("initialAmmo" in unitProperties) {
    const partialUnitWithAmmo = {
      ...partialUnit,
      stats: {
        ...partialUnit.stats,
        ammo: unitProperties.initialAmmo,
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
    default:
      //should never happen
      return {
        type: "infantry",
        ...partialUnit,
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

const loadUnitInto = (unitToLoad: WWUnit, transportUnit: WWUnit) => {
  switch (transportUnit.type) {
    case "transportCopter":
    case "apc": {
      if (unitToLoad.type === "infantry" || unitToLoad.type === "mech")
        transportUnit.loadedUnit = unitToLoad;
      break;
    }
    case "blackBoat": {
      if (unitToLoad.type === "infantry" || unitToLoad.type === "mech") {
        if (transportUnit.loadedUnit === null)
          transportUnit.loadedUnit = unitToLoad;
        else transportUnit.loadedUnit2 = unitToLoad;
      }
      break;
    }
    case "lander": {
      if (
        unitToLoad.type === "infantry" ||
        unitToLoad.type === "mech" ||
        unitToLoad.type === "recon" ||
        unitToLoad.type === "apc" ||
        unitToLoad.type === "artillery" ||
        unitToLoad.type === "tank" ||
        unitToLoad.type === "antiAir" ||
        unitToLoad.type === "missile" ||
        unitToLoad.type === "rocket" ||
        unitToLoad.type === "mediumTank" ||
        unitToLoad.type === "neoTank" ||
        unitToLoad.type === "megaTank"
      ) {
        if (transportUnit.loadedUnit === null) {
          transportUnit.loadedUnit = unitToLoad;
        } else transportUnit.loadedUnit2 = unitToLoad;
      }
      break;
    }
    case "cruiser": {
      if (
        unitToLoad.type === "transportCopter" ||
        unitToLoad.type === "battleCopter"
      ) {
        if (transportUnit.loadedUnit === null) {
          transportUnit.loadedUnit = unitToLoad;
        } else transportUnit.loadedUnit2 = unitToLoad;
      }
      break;
    }
    case "carrier": {
      if (
        unitToLoad.type === "transportCopter" ||
        unitToLoad.type === "battleCopter" ||
        unitToLoad.type === "fighter" ||
        unitToLoad.type === "bomber" ||
        unitToLoad.type === "blackBomb" ||
        unitToLoad.type === "stealth"
      ) {
        if (transportUnit.loadedUnit === null) {
          transportUnit.loadedUnit = unitToLoad;
        } else transportUnit.loadedUnit2 = unitToLoad;
      }
    }
  }
};

export const applyMainEventToMatch = (
  matchId: string,
  currentPlayer: PlayerInMatchWrapper,
  event: WWEvent
) => {
  const match = matchStore.getOrThrow(matchId);

  switch (event.type) {
    case "build": {
      match.units.addUnit(
        createNewUnitFromBuildEvent(event, currentPlayer.data.slot)
      );
      break;
    }
    case "move": {
      const unit = match.units.getUnitOrThrow(event.path[0]);

      //TODO: does fuel consumption need hooks?
      unit.stats.fuel -= event.path.length - 1;

      const unitAtDestination = match.units.getUnit(
        event.path[event.path.length - 1]
      );

      if (unitAtDestination === undefined) {
        unit.position = event.path[event.path.length - 1];
      } else {
        if (unit.type === unitAtDestination.type) {
          //join (hp, fuel, ammo)
          const unitProperties = unitPropertiesMap[unit.type];
          unit.stats.fuel = Math.min(
            unit.stats.fuel + unitAtDestination.stats.fuel,
            unitProperties.initialFuel
          );
          unit.stats.hp = Math.min(
            unit.stats.hp + unitAtDestination.stats.hp,
            99
          );
          if (
            "ammo" in unit.stats &&
            "ammo" in unitAtDestination.stats &&
            "initialAmmo" in unitProperties
          ) {
            unit.stats.ammo = Math.min(
              unit.stats.ammo + unitAtDestination.stats.ammo,
              unitProperties.initialAmmo
            );
          }
        } else {
          //load
          loadUnitInto(unit, unitAtDestination);
          //delete unit
        }
      }
      break;
    }
    case "unload2": {
      const unit = match.units.getUnitOrThrow(event.transportPosition);
      if (event.unloads.isSecondUnit && "loadedUnit2" in unit) {
        match.units.addUnit(
          loadedUnitToWWUnit(
            unit.loadedUnit2,
            unit.playerSlot,
            addDirection(event.transportPosition, event.unloads.direction)
          )
        );
        unit.loadedUnit2 = null;
      } else if (!event.unloads.isSecondUnit && "loadedUnit" in unit) {
        match.units.addUnit(
          loadedUnitToWWUnit(
            unit.loadedUnit,
            unit.playerSlot,
            addDirection(event.transportPosition, event.unloads.direction)
          )
        );
        if ("loadedUnit2" in unit) {
          unit.loadedUnit = unit.loadedUnit2;
          unit.loadedUnit2 = null;
        } else unit.loadedUnit = null;
      }
      break;
    }
    case "coPower": {
      break;
    }
    case "superCOPower": {
      break;
    }
    case "passTurn": {
      break;
    }
    default:
      throw new Error("Received an event that is not a main event");
  }
};

export const applySubEventToMatch = (
  matchId: string,
  currentPlayer: PlayerInMatchWrapper,
  event: WWEvent,
  fromPosition: Position
) => {
  const match = matchStore.getOrThrow(matchId);
  const unit = match.units.getUnitOrThrow(fromPosition);

  switch (event.type) {
    case "wait":
      break;
    case "attack":
      const attacker = match.units.getUnitOrThrow(fromPosition);
      const defender = match.units.getUnitOrThrow(event.defenderPosition);
      if (
        event.defenderHP === 0 //kill unit
      ) {
        match.units.removeUnit(defender);
      } else {
        defender.stats.hp = event.defenderHP;
      }
      if (event.attackerHP !== undefined) {
        if (
          event.attackerHP === 0 //kill unit
        ) {
          match.units.removeUnit(attacker);
        } else {
          attacker.stats.hp = event.attackerHP;
        }
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
            const suppliedUnit = match.units.getUnit(
              addDirection(fromPosition, dir)
            );

            if (suppliedUnit !== undefined) {
              suppliedUnit.stats.fuel =
                unitPropertiesMap[suppliedUnit.type].initialFuel;
            }
          }
          break;
        case "blackBomb":
          match.units.damageUntil1HPInRadius({
            radius: 3,
            damageAmount: 50,
            epicenter: unit.position,
          });

          match.units.removeUnit(unit);
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
            match.units.addUnit(
              loadedUnitToWWUnit(
                unit.loadedUnit2,
                unit.playerSlot,
                addDirection(fromPosition, event.unloads[0].direction)
              )
            );
            unit.loadedUnit2 = null;
          } else if (!event.unloads[0].isSecondUnit && "loadedUnit" in unit) {
            match.units.addUnit(
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
            match.units.addUnit(
              loadedUnitToWWUnit(
                unit.loadedUnit,
                unit.playerSlot,
                addDirection(fromPosition, event.unloads[0].direction)
              )
            );
            match.units.addUnit(
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
      const repairedUnit = match.units.getUnitOrThrow(
        addDirection(fromPosition, event.direction)
      );

      repairedUnit.stats.fuel =
        unitPropertiesMap[repairedUnit.type].initialFuel;
      if (repairedUnit.stats.hp >= 90) repairedUnit.stats.hp = 99;
      else {
        const { cost } = unitPropertiesMap[repairedUnit.type];
        // TODO hook: cost and facility modifiers based on powers etc.
        if (cost * 0.1 <= currentPlayer.data.funds) {
          repairedUnit.stats.hp += 10;
          currentPlayer.data.funds -= cost * 0.1;
        }
      }
      break;
    }
    case "launchMissile": {
      match.units.damageUntil1HPInRadius({
        radius: 3,
        damageAmount: 30,
        epicenter: event.targetPosition,
      });
      break;
    }
  }
  unit.isReady = false;
};
