import type { Position } from "shared/schemas/position";
import type { WWUnit } from "shared/schemas/unit";
import type { UnloadNoWaitEvent } from "shared/types/events";
import type { MatchWrapper } from "shared/wrappers/match";
import { addDirection } from "../../positions";
import { DispatchableError } from "shared/DispatchedError";
import type { UnloadNoWaitAction } from "shared/schemas/action";
import { unitPropertiesMap } from "../../buildable-unit";
import type { MainActionToEvent } from "../handler-types";

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

export const loadedUnitToWWUnit = (
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

export const applyUnloadNoWaitEvent = (
  match: MatchWrapper,
  event: UnloadNoWaitEvent
) => {
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
};
