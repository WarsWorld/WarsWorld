import { DispatchableError } from "shared/DispatchedError";
import type {
  UnloadNoWaitAction,
  UnloadWaitAction,
} from "shared/schemas/action";
import type {
  MainActionToEvent,
  SubActionToEvent,
} from "server/routers/action";
import { unitPropertiesMap } from "../buildable-unit";
import { addDirection } from "../positions";

export const unloadWaitActionToEvent: SubActionToEvent<UnloadWaitAction> = (
  match,
  action,
  fromPosition
) => {
  const player = match.players.getCurrentTurnPlayer();
  const transportUnit = player.getUnits().getUnitOrThrow(fromPosition);

  if (action.unloads.length < 1) {
    throw new DispatchableError("No unit specified to unload");
  }

  if (!("loadedUnit" in transportUnit.data)) {
    throw new DispatchableError(
      "Trying to unload from a unit that can't load units"
    );
  }

  if (transportUnit.data.loadedUnit === null) {
    throw new DispatchableError(
      "Transport doesn't currently have a loaded unit"
    );
  }

  const unloadPosition = addDirection(
    fromPosition,
    action.unloads[0].direction
  );

  match.map.throwIfOutOfBounds(unloadPosition);

  if (action.unloads.length === 1) {
    if (action.unloads[0].isSecondUnit) {
      if (!("loadedUnit2" in transportUnit.data)) {
        throw new DispatchableError(
          "Trying to unload 2nd unit from a unit only carries 1 unit"
        );
      }

      if (transportUnit.data.loadedUnit2 === null) {
        throw new DispatchableError(
          "Transport doesn't currently have a 2nd loaded unit"
        );
      }

      if (
        match.getMovementCost(
          unloadPosition,
          unitPropertiesMap[transportUnit.data.loadedUnit2.type].movementType
        ) === null
      ) {
        throw new DispatchableError("Cannot unload unit in desired position");
      }
    } else {
      if (
        match.getMovementCost(
          unloadPosition,
          unitPropertiesMap[transportUnit.data.loadedUnit.type].movementType
        ) === null
      ) {
        throw new DispatchableError("Cannot unload unit in desired position");
      }
    }
  } else if (action.unloads.length === 2) {
    if (!("loadedUnit2" in transportUnit.data)) {
      throw new DispatchableError(
        "Tried to unload 2 units, but only one can be put in a transport"
      );
    }

    if (transportUnit.data.loadedUnit2 === null) {
      throw new DispatchableError(
        "Transport doesn't currently have a 2nd loaded unit"
      );
    }

    if (action.unloads[0].direction === action.unloads[1].direction) {
      throw new DispatchableError(
        "Trying to unload both units in the same direction"
      );
    }

    if (action.unloads[0].isSecondUnit === action.unloads[1].isSecondUnit) {
      throw new DispatchableError("Trying to unload the same unit twice");
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

    match.map.throwIfOutOfBounds(unloadPosition2);

    if (
      match.getMovementCost(
        unloadPosition,
        unitPropertiesMap[transportUnit.data.loadedUnit.type].movementType
      ) === null
    ) {
      throw new DispatchableError("Cannot unload unit in desired position");
    }

    if (
      match.getMovementCost(
        unloadPosition,
        unitPropertiesMap[transportUnit.data.loadedUnit2.type].movementType
      ) === null
    ) {
      throw new DispatchableError("Cannot unload unit in desired position");
    }
  } else {
    throw new DispatchableError("Trying to unload more than 2 units");
  }

  return action;
};

export const unloadNoWaitActionToEvent: MainActionToEvent<
  UnloadNoWaitAction
> = (match, action) => {
  const player = match.players.getCurrentTurnPlayer();

  const transportUnit = player
    .getUnits()
    .getUnitOrThrow(action.transportPosition);

  if (!("loadedUnit" in transportUnit.data)) {
    throw new DispatchableError(
      "Trying to unload from a unit that can't load units"
    );
  }

  if (transportUnit.data.loadedUnit === null) {
    throw new DispatchableError(
      "Transport doesn't currently have a loaded unit"
    );
  }

  const unloadPosition = addDirection(
    action.transportPosition,
    action.unloads.direction
  );

  match.map.throwIfOutOfBounds(unloadPosition);

  if (action.unloads.isSecondUnit) {
    if (!("loadedUnit2" in transportUnit.data)) {
      throw new DispatchableError(
        "Trying to unload 2nd unit from a unit only carries 1 unit"
      );
    }

    if (transportUnit.data.loadedUnit2 === null) {
      throw new DispatchableError(
        "Transport doesn't currently have a 2nd loaded unit"
      );
    }

    if (
      match.getMovementCost(
        unloadPosition,
        unitPropertiesMap[transportUnit.data.loadedUnit2.type].movementType
      ) === null
    ) {
      throw new DispatchableError("Cannot unload unit in desired position");
    }
  } else {
    if (
      match.getMovementCost(
        unloadPosition,
        unitPropertiesMap[transportUnit.data.loadedUnit.type].movementType
      ) === null
    ) {
      throw new DispatchableError("Cannot unload unit in desired position");
    }
  }

  return action;
};
