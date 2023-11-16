import { unitPropertiesMap } from "../../../shared/match-logic/buildable-unit";
import { addDirection } from "../../../shared/match-logic/positions";
import type { MainActionToEvent, SubActionToEvent } from "../../routers/action";
import type {
  UnloadNoWaitAction,
  UnloadWaitAction,
} from "../../schemas/action";
import { badRequest } from "./trpc-error-manager";

export const unloadWaitActionToEvent: SubActionToEvent<UnloadWaitAction> = ({
  currentPlayer,
  action,
  matchState,
  fromPosition,
}) => {
  const transportUnit = currentPlayer.getUnits().getUnitOrThrow(fromPosition);

  if (action.unloads.length < 1) {
    throw badRequest("No unit specified to unload");
  }

  if (!("loadedUnit" in transportUnit)) {
    throw badRequest("Trying to unload from a unit that can't load units");
  }

  if (transportUnit.loadedUnit === null) {
    throw badRequest("Transport doesn't currently have a loaded unit");
  }

  const unloadPosition = addDirection(
    fromPosition,
    action.unloads[0].direction
  );

  matchState.map.throwIfOutOfBounds(unloadPosition);

  if (action.unloads.length === 1) {
    if (action.unloads[0].isSecondUnit) {
      if (!("loadedUnit2" in transportUnit)) {
        throw badRequest(
          "Trying to unload 2nd unit from a unit only carries 1 unit"
        );
      }

      if (transportUnit.loadedUnit2 === null) {
        throw badRequest("Transport doesn't currently have a 2nd loaded unit");
      }

      if (
        matchState.getMovementCost(
          unloadPosition,
          unitPropertiesMap[transportUnit.loadedUnit2.type].movementType
        ) === null
      ) {
        throw badRequest("Cannot unload unit in desired position");
      }
    } else {
      if (
        matchState.getMovementCost(
          unloadPosition,
          unitPropertiesMap[transportUnit.loadedUnit.type].movementType
        ) === null
      ) {
        throw badRequest("Cannot unload unit in desired position");
      }
    }
  } else if (action.unloads.length === 2) {
    if (!("loadedUnit2" in transportUnit)) {
      throw badRequest(
        "Tried to unload 2 units, but only one can be put in a transport"
      );
    }

    if (transportUnit.loadedUnit2 === null) {
      throw badRequest("Transport doesn't currently have a 2nd loaded unit");
    }

    if (action.unloads[0].direction === action.unloads[1].direction) {
      throw badRequest("Trying to unload both units in the same direction");
    }

    if (action.unloads[0].isSecondUnit === action.unloads[1].isSecondUnit) {
      throw badRequest("Trying to unload the same unit twice");
    }

    if (action.unloads[0].isSecondUnit) {
      [action.unloads[0], action.unloads[1]] = [
        action.unloads[1],
        action.unloads[0],
      ];
    }
    //I LOVE PRETTIER! IT MAKES ALL THINGS SO MUCH PRETTIER!! (^ it's just a swap btw, so first unload is for first unit)

    const unloadPosition2 = addDirection(
      fromPosition,
      action.unloads[1].direction
    );

    matchState.map.throwIfOutOfBounds(unloadPosition2);

    if (
      matchState.getMovementCost(
        unloadPosition,
        unitPropertiesMap[transportUnit.loadedUnit.type].movementType
      ) === null
    ) {
      throw badRequest("Cannot unload unit in desired position");
    }

    if (
      matchState.getMovementCost(
        unloadPosition,
        unitPropertiesMap[transportUnit.loadedUnit2.type].movementType
      ) === null
    ) {
      throw badRequest("Cannot unload unit in desired position");
    }
  } else {
    throw badRequest("Trying to unload more than 2 units");
  }

  return action;
};

export const unloadNoWaitActionToEvent: MainActionToEvent<
  UnloadNoWaitAction
> = ({ currentPlayer, action, matchState }) => {
  const transportUnit = currentPlayer
    .getUnits()
    .getUnitOrThrow(action.transportPosition);

  if (!("loadedUnit" in transportUnit)) {
    throw badRequest("Trying to unload from a unit that can't load units");
  }

  if (transportUnit.loadedUnit === null) {
    throw badRequest("Transport doesn't currently have a loaded unit");
  }

  const unloadPosition = addDirection(
    action.transportPosition,
    action.unloads.direction
  );

  matchState.map.throwIfOutOfBounds(unloadPosition);

  if (action.unloads.isSecondUnit) {
    if (!("loadedUnit2" in transportUnit)) {
      throw badRequest(
        "Trying to unload 2nd unit from a unit only carries 1 unit"
      );
    }

    if (transportUnit.loadedUnit2 === null) {
      throw badRequest("Transport doesn't currently have a 2nd loaded unit");
    }

    if (
      matchState.getMovementCost(
        unloadPosition,
        unitPropertiesMap[transportUnit.loadedUnit2.type].movementType
      ) === null
    ) {
      throw badRequest("Cannot unload unit in desired position");
    }
  } else {
    if (
      matchState.getMovementCost(
        unloadPosition,
        unitPropertiesMap[transportUnit.loadedUnit.type].movementType
      ) === null
    ) {
      throw badRequest("Cannot unload unit in desired position");
    }
  }

  return action;
};
