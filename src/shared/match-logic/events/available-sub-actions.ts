import {
  createPipeSeamUnitEquivalent,
  getBaseDamage,
} from "shared/match-logic/game-constants/base-damage";
import { unitPropertiesMap } from "shared/match-logic/game-constants/unit-properties";
import { getBaseMovementCost } from "shared/match-logic/movement-cost";
import { getWeatherSpecialMovement } from "shared/match-logic/weather";
import type { SubAction } from "shared/schemas/action";
import {
  getDistance,
  getNeighbourPositions,
  isSamePosition,
  type Position,
} from "shared/schemas/position";
import type { MatchWrapper } from "shared/wrappers/match";
import type { PlayerInMatchWrapper } from "shared/wrappers/player-in-match";
import type { UnitWrapper } from "shared/wrappers/unit";

export enum AvailableSubActions {
  "Wait",
  "Join",
  "Load",
  "Capture",
  "Launch", //position handled after subaction selection
  "Supply",
  "Explode",
  "Hide",
  "Show",
  "Unload", //unit to unload and position handled after subaction selection
  "Repair", //unit to repair handled after subaction selection
  "Attack", //unit to attack handled after subaction selection
  "Delete", //has to be handled in a special way because it's not a subaction
}

export const getAvailableSubActions = (
  match: MatchWrapper,
  player: PlayerInMatchWrapper,
  unit: UnitWrapper,
  newPosition: Position,
) => {
  const menuOptions: Map<AvailableSubActions, SubAction> = new Map<
    AvailableSubActions,
    SubAction
  >();
  const tile = match.getTile(newPosition);

  //This grabs the neighboring units in the new position, units.getNeighboringUnits() gets them in the old position
  const neighbourPositions = getNeighbourPositions(newPosition);

  const neighbourUnitsInNewPosition = match.units.filter((unit) =>
    neighbourPositions.some((p) => isSamePosition(unit.data.position, p)),
  );

  //check for wait / join / load (move validity
  // already checked somewhere else)
  //if loading / joining, there is only one menu option
  if (match.getUnit(newPosition) === undefined || isSamePosition(newPosition, unit.data.position)) {
    menuOptions.set(AvailableSubActions.Wait, { type: "wait" });
  } else if (match.getUnit(newPosition)?.data.type === unit.data.type) {
    menuOptions.set(AvailableSubActions.Join, { type: "wait" });
    return menuOptions;
  } else {
    menuOptions.set(AvailableSubActions.Load, { type: "wait" });
    return menuOptions;
  }

  //check for attack, including pipeseams
  if (!unit.isTransport()) {
    let addAttackSubaction = false;

    const pipeSeamUnitEquivalent = createPipeSeamUnitEquivalent(match, unit);

    const canAttackPipeseams = getBaseDamage(unit, pipeSeamUnitEquivalent) !== null;

    if (unit.isIndirect()) {
      console.log("unit is indirect");

      for (let x = 0; x < match.map.width && !addAttackSubaction; x++) {
        for (let y = 0; y < match.map.height && !addAttackSubaction; y++) {
          const distance = getDistance([x, y], unit.data.position);

          if (
            distance <= unit.properties.attackRange[1] &&
            distance >= unit.properties.attackRange[0]
          ) {
            if (
              canAttackPipeseams &&
              !match.map.isOutOfBounds([x, y]) &&
              match.getTile([x, y]).type === "pipeSeam"
            ) {
              addAttackSubaction = true;
            }

            const attackableUnit = match.getUnit([x, y]);

            if (
              attackableUnit &&
              attackableUnit.player.team !== unit.player.team &&
              getBaseDamage(unit, attackableUnit) !== null
            ) {
              addAttackSubaction = true;
            }
          }
        }
      }
    } else {
      if (canAttackPipeseams) {
        for (const adjacentPos of getNeighbourPositions(newPosition)) {
          if (addAttackSubaction) {
            break;
          }

          if (
            !match.map.isOutOfBounds(adjacentPos) &&
            match.getTile(adjacentPos).type === "pipeSeam"
          ) {
            addAttackSubaction = true;
          }
        }
      }

      for (const adjacentUnit of neighbourUnitsInNewPosition) {
        if (addAttackSubaction) {
          break;
        }

        if (
          adjacentUnit.player.team !== unit.player.team &&
          getBaseDamage(unit, adjacentUnit) !== null
        ) {
          addAttackSubaction = true;
        }
      }
    }

    if (addAttackSubaction) {
      //TODO: This implementation needs to actually check where user wants to attack
      menuOptions.set(AvailableSubActions.Attack, {
        type: "attack",
        defenderPosition: [0, 0],
      });
    }
  }

  //check for capture / launch
  if (unit.isInfantryOrMech()) {
    if ("playerSlot" in tile && tile.playerSlot !== player.data.slot) {
      menuOptions.set(AvailableSubActions.Capture, { type: "ability" });
    }

    if (tile.type === "unusedSilo") {
      //TODO: This implementation needs to actually check where user wants missile to go
      menuOptions.set(AvailableSubActions.Launch, {
        type: "launchMissile",
        targetPosition: [0, 0],
      });
    }
  }

  //check for supply
  if (unit.data.type === "apc") {
    for (const adjacentUnit of neighbourUnitsInNewPosition) {
      if (adjacentUnit.player.data.id === unit.player.data.id) {
        menuOptions.set(AvailableSubActions.Supply, { type: "ability" });
        break;
      }
    }
  }

  //check for explode
  if (unit.data.type === "blackBomb") {
    menuOptions.set(AvailableSubActions.Explode, { type: "ability" });
  }

  //check for hide / show
  if ("hidden" in unit.data) {
    if (unit.data.hidden) {
      menuOptions.set(AvailableSubActions.Show, { type: "ability" });
    } else {
      menuOptions.set(AvailableSubActions.Hide, { type: "ability" });
    }
  }

  //check for unload
  if (unit.isTransport()) {
    let addUnloadSubaction = false;

    if (unit.data.loadedUnit !== null) {
      const baseMovementCost = getBaseMovementCost(
        unitPropertiesMap[unit.data.loadedUnit.type].movementType,
        getWeatherSpecialMovement(unit.player),
        tile.type,
        match.rules.gameVersion ?? unit.player.data.coId.version,
      );

      if (baseMovementCost !== null) {
        for (const adjacentPosition of getNeighbourPositions(newPosition)) {
          if (!match.map.isOutOfBounds(adjacentPosition)) {
            const adjacentBaseMovementCost = getBaseMovementCost(
              unitPropertiesMap[unit.data.loadedUnit.type].movementType,
              getWeatherSpecialMovement(unit.player),
              match.getTile(adjacentPosition).type,
              match.rules.gameVersion ?? unit.player.data.coId.version,
            );

            if (adjacentBaseMovementCost !== null) {
              addUnloadSubaction = true;
              break;
            }
          }
        }
      }
    }

    if (!addUnloadSubaction && "loadedUnit2" in unit.data && unit.data.loadedUnit2 !== null) {
      //duplicated code for loadedUnit2
      const baseMovementCost = getBaseMovementCost(
        unitPropertiesMap[unit.data.loadedUnit2.type].movementType,
        getWeatherSpecialMovement(unit.player),
        tile.type,
        match.rules.gameVersion ?? unit.player.data.coId.version,
      );

      if (baseMovementCost !== null) {
        for (const adjacentPosition of getNeighbourPositions(newPosition)) {
          if (!match.map.isOutOfBounds(adjacentPosition)) {
            const adjacentBaseMovementCost = getBaseMovementCost(
              unitPropertiesMap[unit.data.loadedUnit2.type].movementType,
              getWeatherSpecialMovement(unit.player),
              match.getTile(adjacentPosition).type,
              match.rules.gameVersion ?? unit.player.data.coId.version,
            );

            if (adjacentBaseMovementCost !== null) {
              addUnloadSubaction = true;
              break;
            }
          }
        }
      }
    }

    if (addUnloadSubaction) {
      throw new Error("Unload not implemented");
      // availableActions.set(AvailableSubActions.Unload, {type: "unloadWait", });
    }
  }

  //check for repair
  if (unit.data.type === "blackBoat") {
    for (const adjacentUnit of neighbourUnitsInNewPosition) {
      if (adjacentUnit.player.data.id === unit.player.data.id) {
        //TODO: Actually check where user wants to repair
        menuOptions.set(AvailableSubActions.Repair, { type: "repair", direction: "up" });
        break;
      }
    }
  }

  return menuOptions;
};
