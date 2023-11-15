import { MainActionToEvent } from "server/routers/action";
import { MoveAction } from "server/schemas/action";
import { Position, isSamePosition } from "server/schemas/position";
import { unitPropertiesMap } from "shared/match-logic/buildable-unit";
import {
  getUnitAtPosition,
  isOutsideOfMap,
} from "shared/match-logic/positions";
import { getMovementCost } from "shared/match-logic/tiles";
import { getMovementRange } from "./co-hook-utilities";
import { MoveEvent } from "../../../shared/types/events";
import { TRPCError } from "@trpc/server";
import { throwIfUnitIsWaited, throwIfUnitNotOwned, throwMessage } from "./trpc-error-manager";

//TODO: check load!!!
export const createNoMoveEvent: () => MoveEvent = () => {
  return {
    type: "move",
    path: [],
    trap: false,
    subEvent: { type: "wait" },
  };
};

export const moveActionToEvent: MainActionToEvent<MoveAction> = ({
  currentPlayer,
  action,
  matchState,
}) => {
  const unit = getUnitAtPosition(matchState, action.path[0]);

  if (unit === null) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No unit found at specified position",
    });
  }
  throwIfUnitNotOwned(unit, currentPlayer.slot);
  throwIfUnitIsWaited(unit);

  const result = createNoMoveEvent();

  let remainingFuel = unit.stats.fuel;
  let remainingMovePoints = getMovementRange(unit, matchState, currentPlayer);

  for (let i = 0; i < action.path.length; ++i) {
    const position: Position = action.path[i];

    if (isOutsideOfMap(matchState.map, position)) {
      throwMessage("Position is outside of map");
    }

    const moveCost = getMovementCost(
      matchState.map.tiles[position[0]][position[1]].type,
      unitPropertiesMap[unit.type].movementType,
      matchState.currentWeather
    );

    if (moveCost === null) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Cannot move to a desired position",
      });
    }

    const unitInPosition = getUnitAtPosition(matchState, position);
    if (
      unitInPosition !== null &&
      unitInPosition.playerSlot !== unit.playerSlot
    ) {
      //throw new Error("Trying to move through an enemy occupied tile");
      result.trap = true;
      break;
    }

    remainingMovePoints -= moveCost;
    if (remainingMovePoints < 0) {
      throwMessage("Using more move points than available");
    }

    remainingFuel -= 1;
    if (remainingFuel < 0) {
      throwMessage("Trying to use more fuel than there's left");
    }

    if (i === action.path.length - 1) {
      if (unitInPosition !== null) {
        //check if trying to join or load into transport:
        if (unitInPosition.type !== unit.type) {
          if (!("loadedUnit" in unitInPosition)) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Move action ending position is overlapping with an allied unit",
            });
          }
          if (unitInPosition.loadedUnit)
        }
      }
    }

    result.path.push(action.path[i]);
  }

  return result;
};
