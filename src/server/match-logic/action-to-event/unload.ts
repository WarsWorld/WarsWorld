import { MainActionToEvent, SubActionToEvent } from "../../routers/action";
import { UnloadNoWaitAction, UnloadWaitAction } from "../../schemas/action";
import {
  addDirection,
  getUnitAtPosition,
  isOutsideOfMap,
} from "../../../shared/match-logic/positions";
import { TRPCError } from "@trpc/server";
import {
  throwIfNoUnload,
  throwIfUnitIsWaited,
  throwIfUnitNotOwned,
  throwMessage,
} from "./trpc-error-manager";
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
  throwIfNoUnload(action);

  if ("loadedUnit" in transportUnit) {
    if (transportUnit.loadedUnit === null) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Transport doesn't currently have a loaded unit",
      });
    }

    if (action.unloads.length !== 1)
      throwMessage(
        "Tried to unload 2 or 0 units, but only one can be put in a transport"
      );
    if (action.unloads[0].loadedUnitIndex !== 0)
      throwMessage("Trying to unload a unit with non valid index");

    const unloadPosition = addDirection(
      fromPosition,
      action.unloads[0].direction
    );
    if (isOutsideOfMap(matchState.map, unloadPosition)) {
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
  } else if ("loadedUnits" in transportUnit) {
    //TODO: check that all errors are handled
    const loadedUnitsCount = transportUnit.loadedUnits.length;
    if (loadedUnitsCount === 0)
      throwMessage("Transport doesn't have loaded units");

    if (loadedUnitsCount > 1) {
      if (action.unloads[0].direction === action.unloads[1].direction)
        throwMessage("Trying to unload both units in the same direction");
    }

    for (let i = 0; i < action.unloads.length; ++i) {
      if (
        action.unloads[i].loadedUnitIndex < 0 ||
        action.unloads[i].loadedUnitIndex >= loadedUnitsCount
      )
        throwMessage("Trying to unload a unit with non valid index");

      const unloadPosition = addDirection(
        fromPosition,
        action.unloads[i].direction
      );
      if (isOutsideOfMap(matchState.map, unloadPosition)) {
        throwMessage("Unload position is outside of map");
      }

      if (
        getMovementCost(
          matchState.map.tiles[unloadPosition[0]][unloadPosition[1]].type,
          unitPropertiesMap[
            transportUnit.loadedUnits[action.unloads[i].loadedUnitIndex].type
          ].movementType,
          matchState.currentWeather
        ) === null
      )
        throwMessage("Cannot unload unit in desired position");
    }
  } else throwMessage("Specified unit is not a transport");

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

  const unloadPosition = addDirection(
    action.transportPosition,
    action.unloads.direction
  );

  if ("loadedUnit" in transportUnit) {
    if (transportUnit.loadedUnit === null) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Transport doesn't currently have a loaded unit",
      });
    }

    if (action.unloads.loadedUnitIndex !== 0)
      throwMessage("Trying to unload a unit with non valid index");

    if (isOutsideOfMap(matchState.map, unloadPosition)) {
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
  } else if ("loadedUnits" in transportUnit) {
    //TODO: check that all errors are handled
    const loadedUnitsCount = transportUnit.loadedUnits.length;
    if (loadedUnitsCount === 0)
      throwMessage("Transport doesn't have loaded units");

    if (
      action.unloads.loadedUnitIndex < 0 ||
      action.unloads.loadedUnitIndex >= loadedUnitsCount
    )
      throwMessage("Trying to unload a unit with non valid index");

    if (isOutsideOfMap(matchState.map, unloadPosition)) {
      throwMessage("Unload position is outside of map");
    }

    if (
      getMovementCost(
        matchState.map.tiles[unloadPosition[0]][unloadPosition[1]].type,
        unitPropertiesMap[
          transportUnit.loadedUnits[action.unloads.loadedUnitIndex].type
        ].movementType,
        matchState.currentWeather
      ) === null
    )
      throwMessage("Cannot unload unit in desired position");
  } else throwMessage("Specified unit is not a transport");

  return action;
};
