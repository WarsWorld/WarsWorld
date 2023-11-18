import { allDirections } from "shared/schemas/direction";
import type { PlayerSlot } from "shared/schemas/player-slot";
import type { Position } from "shared/schemas/position";
import type { WWUnit } from "shared/schemas/unit";
import type { MatchWrapper } from "shared/wrappers/match";
import type { BuildEvent, WWEvent } from "../types/events";
import { unitPropertiesMap } from "./buildable-unit";
import { addDirection } from "./positions";

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
    isReady: false,
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
      if (unitToLoad.type === "infantry" || unitToLoad.type === "mech") {
        transportUnit.loadedUnit = unitToLoad;
      }

      break;
    }
    case "blackBoat": {
      if (unitToLoad.type === "infantry" || unitToLoad.type === "mech") {
        if (transportUnit.loadedUnit === null) {
          transportUnit.loadedUnit = unitToLoad;
        } else {
          transportUnit.loadedUnit2 = unitToLoad;
        }
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
        } else {
          transportUnit.loadedUnit2 = unitToLoad;
        }
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
        } else {
          transportUnit.loadedUnit2 = unitToLoad;
        }
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
        } else {
          transportUnit.loadedUnit2 = unitToLoad;
        }
      }
    }
  }
};

//TODO: call subevents from move case? or different?
export const applyMainEventToMatch = (match: MatchWrapper, event: WWEvent) => {
  switch (event.type) {
    case "build": {
      match.addUnwrappedUnit(
        createNewUnitFromBuildEvent(
          event,
          match.players.getCurrentTurnPlayer().data.slot
        )
      );
      break;
    }
    case "move": {
      const player = match.players.getCurrentTurnPlayer();

      //check if unit is moving or just standing still
      if (event.path.length <= 1) {
        break;
      }

      const unit = match.units.getUnitOrThrow(event.path[0]);

      //if unit was capturing, interrupt capture
      if ("currentCapturePoints" in unit) {
        unit.currentCapturePoints = undefined;
      }

      unit.data.stats.fuel -=
        (event.path.length - 1) *
        player.getCOHooksWithUnit(event.path[0]).onFuelCost(1);

      const unitAtDestination = match.units.getUnit(
        event.path[event.path.length - 1]
      );

      if (unitAtDestination === undefined) {
        unit.data.position = event.path[event.path.length - 1];
      } else {
        if (unit.data.type === unitAtDestination.data.type) {
          //join (hp, fuel, ammo, (keep capture points))
          const unitProperties = unitPropertiesMap[unit.data.type];
          unitAtDestination.data.stats.fuel = Math.min(
            unit.data.stats.fuel + unitAtDestination.data.stats.fuel,
            unitProperties.initialFuel
          );
          unitAtDestination.data.stats.hp = Math.min(
            unit.data.stats.hp + unitAtDestination.data.stats.hp,
            99
          );

          if (
            "ammo" in unit.data.stats &&
            "ammo" in unitAtDestination.data.stats &&
            "initialAmmo" in unitProperties
          ) {
            unitAtDestination.data.stats.ammo = Math.min(
              unit.data.stats.ammo + unitAtDestination.data.stats.ammo,
              unitProperties.initialAmmo
            );
          }

          match.units.removeUnit(unit);
        } else {
          //load
          loadUnitInto(unit.data, unitAtDestination.data);
          match.units.removeUnit(unit);
        }
      }

      break;
    }
    case "unload2": {
      const unit = match.units.getUnitOrThrow(event.transportPosition);

      if (event.unloads.isSecondUnit && "loadedUnit2" in unit.data) {
        match.addUnwrappedUnit(
          loadedUnitToWWUnit(
            unit.data.loadedUnit2,
            unit.data.playerSlot,
            addDirection(event.transportPosition, event.unloads.direction)
          )
        );
        unit.data.loadedUnit2 = null;
      } else if (!event.unloads.isSecondUnit && "loadedUnit" in unit.data) {
        match.addUnwrappedUnit(
          loadedUnitToWWUnit(
            unit.data.loadedUnit,
            unit.data.playerSlot,
            addDirection(event.transportPosition, event.unloads.direction)
          )
        );

        if ("loadedUnit2" in unit.data) {
          unit.data.loadedUnit = unit.data.loadedUnit2;
          unit.data.loadedUnit2 = null;
        } else {
          unit.data.loadedUnit = null;
        }
      }

      break;
    }
    case "coPower": {
      const player = match.players.getCurrentTurnPlayer();

      break;
    }
    case "superCOPower": {
      break;
    }
    case "passTurn": {
      break;
    }
    case "player-picked-co": {
      const player = match.players.getByIdOrThrow(event.playerId);
      player.data.co = event.co;
      break;
    }
    default: {
      throw new Error("Received an event that is not a main event");
    }
  }
};

export const applySubEventToMatch = (
  match: MatchWrapper,
  event: WWEvent,
  fromPosition: Position
) => {
  const unit = match.units.getUnitOrThrow(fromPosition);

  switch (event.type) {
    case "wait":
      break;
    case "attack": {
      const attacker = match.units.getUnitOrThrow(fromPosition);
      const defender = match.units.getUnitOrThrow(event.defenderPosition);

      if (event.defenderHP === 0) {
        match.units.removeUnit(defender);
      } else {
        defender.data.stats.hp = event.defenderHP;
      }

      if (event.attackerHP !== undefined) {
        if (event.attackerHP === 0) {
          match.units.removeUnit(attacker);
        } else {
          attacker.data.stats.hp = event.attackerHP;
        }
      }

      break;
    }
    case "ability": {
      const player = match.players.getCurrentTurnPlayer();

      switch (unit.data.type) {
        case "infantry":
        case "mech": {
          //capture tile
          if (unit.data.currentCapturePoints === undefined) {
            unit.data.currentCapturePoints = 20;
          }

          unit.data.currentCapturePoints -= player
            .getCOHooksWithUnit(unit.data.position)
            .onCapture(unit.data.stats.hp);

          if (unit.data.currentCapturePoints <= 0) {
            unit.data.currentCapturePoints = undefined;
            match.captureTile(unit.data.position);
          }

          break;
        }
        case "apc": {
          //supply
          for (const dir of allDirections) {
            const suppliedUnit = match.units.getUnit(
              addDirection(fromPosition, dir)
            );

            if (suppliedUnit !== undefined) {
              suppliedUnit.data.stats.fuel =
                unitPropertiesMap[suppliedUnit.data.type].initialFuel;
            }
          }

          break;
        }
        case "blackBomb": {
          match.units.damageUntil1HPInRadius({
            radius: 3,
            damageAmount: 50,
            epicenter: unit.data.position,
          });
          match.units.removeUnit(unit);
          break;
        }
        case "stealth":
        case "sub": {
          //toggle hide
          if ("hidden" in unit) {
            unit.hidden = !unit.hidden;
          }

          break;
        }
      }

      break;
    }
    case "unload1": {
      switch (event.unloads.length) {
        case 1:
          if (event.unloads[0].isSecondUnit && "loadedUnit2" in unit.data) {
            match.addUnwrappedUnit(
              loadedUnitToWWUnit(
                unit.data.loadedUnit2,
                unit.data.playerSlot,
                addDirection(fromPosition, event.unloads[0].direction)
              )
            );
            unit.data.loadedUnit2 = null;
          } else if (
            !event.unloads[0].isSecondUnit &&
            "loadedUnit" in unit.data
          ) {
            match.addUnwrappedUnit(
              loadedUnitToWWUnit(
                unit.data.loadedUnit,
                unit.data.playerSlot,
                addDirection(fromPosition, event.unloads[0].direction)
              )
            );

            if ("loadedUnit2" in unit.data) {
              unit.data.loadedUnit = unit.data.loadedUnit2;
              unit.data.loadedUnit2 = null;
            } else {
              unit.data.loadedUnit = null;
            }
          }

          break;
        case 2:
          //unload all. unloads[0] refers to 1st unit, unloads[1] refers to 2nd unit
          if ("loadedUnit" in unit && "loadedUnit2" in unit.data) {
            match.addUnwrappedUnit(
              loadedUnitToWWUnit(
                unit.data.loadedUnit,
                unit.data.playerSlot,
                addDirection(fromPosition, event.unloads[0].direction)
              )
            );
            match.addUnwrappedUnit(
              loadedUnitToWWUnit(
                unit.data.loadedUnit2,
                unit.data.playerSlot,
                addDirection(fromPosition, event.unloads[1].direction)
              )
            );
            unit.data.loadedUnit = null;
            unit.data.loadedUnit2 = null;
          }

          break;
        default:
          break;
      }

      break;
    }
    case "repair": {
      const player = match.players.getCurrentTurnPlayer();

      const repairedUnit = match.units.getUnitOrThrow(
        addDirection(fromPosition, event.direction)
      );

      repairedUnit.data.stats.fuel =
        unitPropertiesMap[repairedUnit.data.type].initialFuel;

      //heal for free if visible hp is 10
      if (repairedUnit.data.stats.hp >= 90) {
        repairedUnit.data.stats.hp = 99;
      } else {
        //check if enough funds for heal, and heal if it's the case
        const unitCost = unitPropertiesMap[repairedUnit.data.type].cost;
        const repairEffectiveCost =
          player
            .getCOHooksWithUnit(addDirection(fromPosition, event.direction))
            .onBuildCost(unitCost) * 0.1;

        if (repairEffectiveCost <= player.data.funds) {
          repairedUnit.data.stats.hp += 10;
          player.data.funds -= repairEffectiveCost;
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

  unit.data.isReady = false;
};
