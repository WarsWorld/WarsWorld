import { DispatchableError } from "shared/DispatchedError";
import type { UnloadNoWaitAction } from "shared/schemas/action";
import type { UnloadNoWaitEvent } from "shared/types/events";
import type { MatchWrapper } from "shared/wrappers/match";
import { addDirection } from "shared/schemas/position";
import type { MainActionToEvent } from "../handler-types";
import { throwIfUnitCantBeUnloadedToTile } from "./unloadWait";

export const unloadNoWaitActionToEvent: MainActionToEvent<UnloadNoWaitAction> = (match, action) => {
  const player = match.getCurrentTurnPlayer();

  const transportUnit = match.getUnitOrThrow(action.transportPosition);

  if (!player.owns(transportUnit)) {
    throw new DispatchableError("You don't own this unit")
  }

  if (!("loadedUnit" in transportUnit.data)) {
    throw new DispatchableError("Trying to unload from a unit that can't load units");
  }

  if (transportUnit.data.loadedUnit === null) {
    throw new DispatchableError("Transport doesn't currently have a loaded unit");
  }

  const unloadPosition = addDirection(action.transportPosition, action.unloads.direction);

  match.map.throwIfOutOfBounds(unloadPosition);

  if (action.unloads.isSecondUnit) {
    if (!("loadedUnit2" in transportUnit.data)) {
      throw new DispatchableError("Trying to unload 2nd unit from a unit only carries 1 unit");
    }

    if (transportUnit.data.loadedUnit2 === null) {
      throw new DispatchableError("Transport doesn't currently have a 2nd loaded unit");
    }

    throwIfUnitCantBeUnloadedToTile(transportUnit.data.loadedUnit2, match.getTile(unloadPosition))
  } else {
    throwIfUnitCantBeUnloadedToTile(transportUnit.data.loadedUnit, match.getTile(unloadPosition))
  }

  return action;
};

export const applyUnloadNoWaitEvent = (match: MatchWrapper, event: UnloadNoWaitEvent) => {
  const unit = match.getUnitOrThrow(event.transportPosition);

  if (event.unloads.isSecondUnit && "loadedUnit2" in unit.data) {
    if (unit.data.loadedUnit2 === null) {
      throw new Error("Can't unload from empty unit slot 2");
    }

    unit.player.addUnwrappedUnit({
      ...unit.data.loadedUnit2,
      isReady: false,
      position: addDirection(event.transportPosition, event.unloads.direction)
    });

    unit.data.loadedUnit2 = null;
  } else if (!event.unloads.isSecondUnit && "loadedUnit" in unit.data) {
    if (unit.data.loadedUnit === null) {
      throw new Error("Can't unload from empty unit slot 2");
    }

    unit.player.addUnwrappedUnit({
      ...unit.data.loadedUnit,
      isReady: false,
      position: addDirection(event.transportPosition, event.unloads.direction)
    });

    if ("loadedUnit2" in unit.data) {
      unit.data.loadedUnit = unit.data.loadedUnit2;
      unit.data.loadedUnit2 = null;
    } else {
      unit.data.loadedUnit = null;
    }
  }
};
