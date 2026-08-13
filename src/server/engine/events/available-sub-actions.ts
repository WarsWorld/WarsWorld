import { createPipeSeamUnitEquivalent, getBaseDamage } from "server/engine/constants/base-damage";
import { unitPropertiesMap } from "server/engine/constants/unit-properties";
import { getBaseMovementCost } from "server/engine/rules/movement-cost";
import { getWeatherSpecialMovement } from "server/engine/rules/weather";
import type { SubAction } from "server/core/schemas/action";
import {
  getDistance,
  getNeighbourPositions,
  isSamePosition,
  type Position,
} from "server/core/schemas/position";
import type { MatchWrapper } from "server/engine/entities/match";
import type { PlayerInMatchWrapper } from "server/engine/entities/player-in-match";
import type { UnitWrapper } from "server/engine/entities/unit";

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
  hasMoved: boolean,
) => {
  const menuOptions: Map<AvailableSubActions, SubAction | undefined> = new Map<
    AvailableSubActions,
    SubAction | undefined
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

    if (unit.isIndirect() && !hasMoved) {
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

            // Only a VISIBLE enemy may light up the Attack option — a fog-hidden / dived enemy in
            // range must not, or the mere presence of the menu entry leaks it (same rule as
            // getAttackTargetTiles). In a non-fog game canSeeUnitAtPosition is true for every
            // ordinary unit, so this only changes behaviour for genuinely concealed units.
            if (
              attackableUnit &&
              attackableUnit.player.team !== unit.player.team &&
              unit.player.team.canSeeUnitAtPosition([x, y]) &&
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

        // A concealed enemy adjacent to the destination must not surface via the Attack option
        // (see the indirect branch above); gate on the viewer team's vision like getAttackTargetTiles.
        if (
          adjacentUnit.player.team !== unit.player.team &&
          unit.player.team.canSeeUnitAtPosition(adjacentUnit.data.position) &&
          getBaseDamage(unit, adjacentUnit) !== null
        ) {
          addAttackSubaction = true;
        }
      }
    }

    if (addAttackSubaction) {
      //handled later
      menuOptions.set(AvailableSubActions.Attack, undefined);
    }
  }

  //check for capture / launch
  if (unit.isInfantryOrMech()) {
    if ("playerSlot" in tile && tile.playerSlot !== player.data.slot) {
      menuOptions.set(AvailableSubActions.Capture, { type: "ability" });
    }

    if (tile.type === "unusedSilo" && "fired" in tile && !tile.fired) {
      //handled later
      menuOptions.set(AvailableSubActions.Launch, undefined);
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
  if (player.getVersionProperties().unloadOnlyAfterMove && unit.isTransport()) {
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
      menuOptions.set(AvailableSubActions.Unload, undefined); //handled later
    }
  }

  //check for repair
  if (unit.data.type === "blackBoat") {
    for (const adjacentUnit of neighbourUnitsInNewPosition) {
      if (adjacentUnit.player.data.id === unit.player.data.id) {
        //available directions handled later
        menuOptions.set(AvailableSubActions.Repair, undefined);
        break;
      }
    }
  }

  //check for delete (technically not a subaction)
  if (!hasMoved) {
    menuOptions.set(AvailableSubActions.Delete, undefined);
  }

  return menuOptions;
};
