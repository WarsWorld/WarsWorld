import { MainActionToEvent, SubActionToEvent } from "../../routers/action";
import { UnloadNoWaitAction, UnloadWaitAction } from "../../schemas/action";
import {
  addDirection,
  getUnitAtPosition,
  isOutsideOfMap,
} from "../../../shared/match-logic/positions";
import { TRPCError } from "@trpc/server";
import { throwIfUnitNotOwned, throwMessage } from "./trpc-error-manager";
import { getMovementCost } from "../../../shared/match-logic/tiles";
import { unitPropertiesMap } from "../../../shared/match-logic/buildable-unit";

export const unloadWaitActionToEvent: SubActionToEvent<UnloadWaitAction> = ({
  currentPlayer,
  action,
  matchState,
  fromPosition,
}) => {
  const transportUnit = getUnitAtPosition(matchState, fromPosition);

  if (transportUnit === null) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No unit found at specified transport position",
    });
  }
  throwIfUnitNotOwned(transportUnit, currentPlayer.slot);
  if (action.unloads.length < 1) throwMessage("No unit specified to unload");

  if (!("loadedUnit" in transportUnit)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Trying to unload from a unit that can't load units",
    });
  }

  if (transportUnit.loadedUnit === null) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Transport doesn't currently have a loaded unit",
    });
  }

  const unloadPosition = addDirection(
    fromPosition,
    action.unloads[0].direction
  );
  if (isOutsideOfMap(matchState.map, unloadPosition)) {
    throwMessage("Unload position is outside of map");
  }

  if (action.unloads.length === 1) {
    if (action.unloads[0].isSecondUnit) {
      if (!("loadedUnit2" in transportUnit)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Trying to unload 2nd unit from a unit only carries 1 unit",
        });
      }

      if (transportUnit.loadedUnit2 === null) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Transport doesn't currently have a 2nd loaded unit",
        });
      }

      if (
        getMovementCost(
          matchState.map.tiles[unloadPosition[0]][unloadPosition[1]].type,
          unitPropertiesMap[transportUnit.loadedUnit2.type].movementType,
          matchState.currentWeather
        ) === null
      )
        throwMessage("Cannot unload unit in desired position");
    } else {
      if (
        getMovementCost(
          matchState.map.tiles[unloadPosition[0]][unloadPosition[1]].type,
          unitPropertiesMap[transportUnit.loadedUnit.type].movementType,
          matchState.currentWeather
        ) === null
      )
        throwMessage("Cannot unload unit in desired position");
    }
  } else if (action.unloads.length === 2) {
    if (!("loadedUnit2" in transportUnit)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "Tried to unload 2 units, but only one can be put in a transport",
      });
    }
    if (transportUnit.loadedUnit2 === null) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Transport doesn't currently have a 2nd loaded unit",
      });
    }

    if (action.unloads[0].direction === action.unloads[1].direction)
      throwMessage("Trying to unload both units in the same direction");

    if (action.unloads[0].isSecondUnit === action.unloads[1].isSecondUnit)
      throwMessage("Trying to unload the same unit twice");
    if (action.unloads[0].isSecondUnit)
      [action.unloads[0], action.unloads[1]] = [
        action.unloads[1],
        action.unloads[0],
      ];
    //I LOVE PRETTIER! IT MAKES ALL THINGS SO MUCH PRETTIER!! (^ it's just a swap btw, so first unload is for first unit)

    const unloadPosition2 = addDirection(
      fromPosition,
      action.unloads[1].direction
    );
    if (isOutsideOfMap(matchState.map, unloadPosition2)) {
      throwMessage("Unload position is outside of map");
    }

    if (
      getMovementCost(
        matchState.map.tiles[unloadPosition[0]][unloadPosition[1]].type,
        unitPropertiesMap[transportUnit.loadedUnit.type].movementType,
        matchState.currentWeather
      ) === null
    )
      throwMessage("Cannot unload unit in desired position");

    if (
      getMovementCost(
        matchState.map.tiles[unloadPosition[0]][unloadPosition[1]].type,
        unitPropertiesMap[transportUnit.loadedUnit2.type].movementType,
        matchState.currentWeather
      ) === null
    )
      throwMessage("Cannot unload unit in desired position");
  } else {
    throwMessage("Trying to unload more than 2 units");
  }

  return action;
};

export const unloadNoWaitActionToEvent: MainActionToEvent<
  UnloadNoWaitAction
> = ({ currentPlayer, action, matchState }) => {
  const transportUnit = getUnitAtPosition(matchState, action.transportPosition);

  if (transportUnit === null) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No unit found at specified transport position",
    });
  }
  throwIfUnitNotOwned(transportUnit, currentPlayer.slot);

  if (!("loadedUnit" in transportUnit)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Trying to unload from a unit that can't load units",
    });
  }

  if (transportUnit.loadedUnit === null) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Transport doesn't currently have a loaded unit",
    });
  }

  const unloadPosition = addDirection(
    action.transportPosition,
    action.unloads.direction
  );
  if (isOutsideOfMap(matchState.map, unloadPosition)) {
    throwMessage("Unload position is outside of map");
  }

  if (action.unloads.isSecondUnit) {
    if (!("loadedUnit2" in transportUnit)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Trying to unload 2nd unit from a unit only carries 1 unit",
      });
    }

    if (transportUnit.loadedUnit2 === null) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Transport doesn't currently have a 2nd loaded unit",
      });
    }

    if (
      getMovementCost(
        matchState.map.tiles[unloadPosition[0]][unloadPosition[1]].type,
        unitPropertiesMap[transportUnit.loadedUnit2.type].movementType,
        matchState.currentWeather
      ) === null
    )
      throwMessage("Cannot unload unit in desired position");
  } else {
    if (
      getMovementCost(
        matchState.map.tiles[unloadPosition[0]][unloadPosition[1]].type,
        unitPropertiesMap[transportUnit.loadedUnit.type].movementType,
        matchState.currentWeather
      ) === null
    )
      throwMessage("Cannot unload unit in desired position");
  }

  return action;
};
