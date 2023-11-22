import { DispatchableError } from "shared/DispatchedError";
import type { UnloadWaitAction } from "shared/schemas/action";
import type { Position } from "shared/schemas/position";
import type { UnloadWaitEvent } from "shared/types/events";
import type { MatchWrapper } from "shared/wrappers/match";
import { unitPropertiesMap } from "../../buildable-unit";
import { addDirection } from "../../positions";
import type { SubActionToEvent } from "../handler-types";

export const unloadWaitActionToEvent: SubActionToEvent<UnloadWaitAction> = (match, action, fromPosition) => {
  const player = match.players.getCurrentTurnPlayer();
  const { data: transportUnit } = player.getUnits().getUnitOrThrow(fromPosition);

  if (action.unloads.length < 1) {
    throw new DispatchableError("No unit specified to unload");
  }

  if (!("loadedUnit" in transportUnit)) {
    throw new DispatchableError("Trying to unload from a unit that can't load units");
  }

  if (transportUnit.loadedUnit === null) {
    throw new DispatchableError("Transport doesn't currently have a loaded unit");
  }

  const unloadPosition = addDirection(fromPosition, action.unloads[0].direction);

  match.map.throwIfOutOfBounds(unloadPosition);

  if (action.unloads.length === 1) {
    if (action.unloads[0].isSecondUnit) {
      if (!("loadedUnit2" in transportUnit)) {
        throw new DispatchableError("Trying to unload 2nd unit from a unit only carries 1 unit");
      }

      if (transportUnit.loadedUnit2 === null) {
        throw new DispatchableError("Transport doesn't currently have a 2nd loaded unit");
      }

      if (match.getMovementCost(unloadPosition, unitPropertiesMap[transportUnit.loadedUnit2.type].movementType) === null) {
        throw new DispatchableError("Cannot unload unit in desired position");
      }
    } else {
      if (match.getMovementCost(unloadPosition, unitPropertiesMap[transportUnit.loadedUnit.type].movementType) === null) {
        throw new DispatchableError("Cannot unload unit in desired position");
      }
    }
  } else if (action.unloads.length === 2) {
    if (!("loadedUnit2" in transportUnit)) {
      throw new DispatchableError("Tried to unload 2 units, but only one can be put in a transport");
    }

    if (transportUnit.loadedUnit2 === null) {
      throw new DispatchableError("Transport doesn't currently have a 2nd loaded unit");
    }

    if (action.unloads[0].direction === action.unloads[1].direction) {
      throw new DispatchableError("Trying to unload both units in the same direction");
    }

    if (action.unloads[0].isSecondUnit === action.unloads[1].isSecondUnit) {
      throw new DispatchableError("Trying to unload the same unit twice");
    }

    if (action.unloads[0].isSecondUnit) {
      [action.unloads[0], action.unloads[1]] = [action.unloads[1], action.unloads[0]];
    }
    //I LOVE PRETTIER! IT MAKES ALL THINGS SO MUCH PRETTIER!! (^ it's just a swap btw, so first unload is for first unit)

    const unloadPosition2 = addDirection(fromPosition, action.unloads[1].direction);

    match.map.throwIfOutOfBounds(unloadPosition2);

    if (match.getMovementCost(unloadPosition, unitPropertiesMap[transportUnit.loadedUnit.type].movementType) === null) {
      throw new DispatchableError("Cannot unload unit in desired position");
    }

    if (match.getMovementCost(unloadPosition, unitPropertiesMap[transportUnit.loadedUnit2.type].movementType) === null) {
      throw new DispatchableError("Cannot unload unit in desired position");
    }
  } else {
    throw new DispatchableError("Trying to unload more than 2 units");
  }

  return action;
};

export const applyUnloadWaitEvent = (match: MatchWrapper, event: UnloadWaitEvent, transportPosition: Position) => {
  const unit = match.units.getUnitOrThrow(transportPosition);

  if (event.unloads.length === 1) {
    if (event.unloads[0].isSecondUnit && "loadedUnit2" in unit.data) {
      if (unit.data.loadedUnit2 === null) {
        throw new Error("Can't unload from empty slot 2");
      }

      unit.player.addUnwrappedUnit({
        ...unit.data.loadedUnit2,
        isReady: false,
        position: addDirection(transportPosition, event.unloads[1].direction)
      });

      unit.data.loadedUnit2 = null;
    } else if (!event.unloads[0].isSecondUnit && "loadedUnit" in unit.data) {
      if (unit.data.loadedUnit === null) {
        throw new Error("Can't unload from empty slot 1");
      }

      unit.player.addUnwrappedUnit({
        ...unit.data.loadedUnit,
        isReady: false,
        position: addDirection(transportPosition, event.unloads[0].direction)
      });

      if ("loadedUnit2" in unit.data) {
        unit.data.loadedUnit = unit.data.loadedUnit2;
        unit.data.loadedUnit2 = null;
      } else {
        unit.data.loadedUnit = null;
      }
    }
  }

  if (event.unloads.length === 2) {
    //unload all. unloads[0] refers to 1st unit, unloads[1] refers to 2nd unit
    if ("loadedUnit" in unit.data && "loadedUnit2" in unit.data) {
      if (unit.data.loadedUnit === null || unit.data.loadedUnit2 === null) {
        throw new Error("Tried to unload a unit from an empty loadedUnit slot");
      }

      unit.player.addUnwrappedUnit({
        ...unit.data.loadedUnit,
        isReady: false,
        position: addDirection(transportPosition, event.unloads[0].direction)
      });

      unit.player.addUnwrappedUnit({
        ...unit.data.loadedUnit2,
        isReady: false,
        position: addDirection(transportPosition, event.unloads[1].direction)
      });

      unit.data.loadedUnit = null;
      unit.data.loadedUnit2 = null;
    }
  }
};
