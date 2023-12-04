import { DispatchableError } from "shared/DispatchedError";
import { unitPropertiesMap } from "shared/match-logic/game-constants/unit-properties";
import { terrainProperties } from "shared/match-logic/game-constants/terrain-properties";
import type { UnloadWaitAction } from "shared/schemas/action";
import type { Position } from "shared/schemas/position";
import type { Tile } from "shared/schemas/tile";
import type { UnitType } from "shared/schemas/unit";
import type { UnloadWaitEvent } from "shared/types/events";
import type { ChangeableTile } from "shared/types/server-match-state";
import type { MatchWrapper } from "shared/wrappers/match";
import { addDirection } from "shared/schemas/position";
import type { SubActionToEvent } from "../handler-types";

export function throwIfUnitCantBeUnloadedToTile(unit: { type: UnitType }, tile: Tile | ChangeableTile) {
  const loadedUnitMovementType = unitPropertiesMap[unit.type].movementType
  const tileType = tile.type

  if (!(loadedUnitMovementType in terrainProperties[tileType])) {
    throw new DispatchableError("Cannot unload unit in desired position");
  }
}

export const unloadWaitActionToEvent: SubActionToEvent<UnloadWaitAction> = (match, action, fromPosition) => {
  const player = match.getCurrentTurnPlayer();

  if (!player.getVersionProperties().unloadOnlyAfterMove) {
    throw new DispatchableError("This type of unload is illegal in this version/setting");
  }

  const transportUnit = match.getUnitOrThrow(fromPosition);

  if (!player.owns(transportUnit)) {
    throw new DispatchableError("You don't own this unit")
  }

  if (action.unloads.length < 1) {
    throw new DispatchableError("No unit specified to unload");
  }

  if (!transportUnit.isTransport()) {
    throw new DispatchableError("Trying to unload from a unit that can't load units");
  }

  if (transportUnit.data.loadedUnit === null) {
    throw new DispatchableError("Transport doesn't currently have a loaded unit");
  }

  const unloadPosition = addDirection(fromPosition, action.unloads[0].direction);

  match.map.throwIfOutOfBounds(unloadPosition);

  if (action.unloads.length === 1) {
    if (action.unloads[0].isSecondUnit) {
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
  } else if (action.unloads.length === 2) {
    if (!("loadedUnit2" in transportUnit.data)) {
      throw new DispatchableError("Tried to unload 2 units, but only one can be put in a transport");
    }

    if (transportUnit.data.loadedUnit2 === null) {
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

    throwIfUnitCantBeUnloadedToTile(transportUnit.data.loadedUnit, match.getTile(unloadPosition))
    throwIfUnitCantBeUnloadedToTile(transportUnit.data.loadedUnit2, match.getTile(unloadPosition2))
  } else {
    throw new DispatchableError("Trying to unload more than 2 units");
  }

  return action;
};

export const applyUnloadWaitEvent = (match: MatchWrapper, event: UnloadWaitEvent, transportPosition: Position) => {
  const unit = match.getUnitOrThrow(transportPosition);

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
    } else if (!event.unloads[0].isSecondUnit && unit.isTransport()) {
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
