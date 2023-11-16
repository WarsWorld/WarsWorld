import type { MainActionToEvent } from "server/routers/action";
import type { MoveAction } from "server/schemas/action";
import { unitPropertiesMap } from "shared/match-logic/buildable-unit";
import type { MoveEvent } from "../../../shared/types/events";
import { badRequest } from "./trpc-error-manager";
import { isSamePosition } from "../../schemas/position";

export const createNoMoveEvent = (): MoveEvent => ({
  type: "move",
  path: [],
  trap: false,
  subEvent: { type: "wait" },
});

export const moveActionToEvent: MainActionToEvent<MoveAction> = ({
  currentPlayer,
  action,
  matchState,
}) => {
  const unit = currentPlayer.getUnits().getUnitOrThrow(action.path[0]);
  if (!unit.isReady) {
    throw badRequest("Trying to move a waited unit");
  }

  const result = createNoMoveEvent();

  let remainingMovePoints = currentPlayer.getMovementPoints(unit);

  const fuelNeeded =
    (action.path.length - 1) *
    currentPlayer.getCOHooksWithUnit(action.path[0]).onFuelCost(1);

  if (unit.stats.fuel < fuelNeeded) {
    throw badRequest("Not enough fuel for this move");
  }

  for (let i = 0; i < action.path.length; ++i) {
    const position = action.path[i];

    matchState.map.throwIfOutOfBounds(position);

    const moveCost = matchState.getMovementCost(
      position,
      unitPropertiesMap[unit.type].movementType
    );

    if (moveCost === null) {
      throw badRequest("Cannot move to a desired position");
    }

    if (result.path.find((pos) => isSamePosition(pos, position))) {
      throw badRequest("The given path passes through the same position twice");
    }

    const unitInPosition = matchState.units.getUnit(position);

    if (unitInPosition?.playerSlot === unit.playerSlot) {
      result.trap = true;
      break;
    }

    if (moveCost > remainingMovePoints) {
      throw badRequest("Using more move points than available");
    }
    remainingMovePoints -= moveCost;

    if (
      i === action.path.length - 1 &&
      unitInPosition !== undefined &&
      unitInPosition.type !== unit.type
    ) {
      //check if trying to join (same unit type) or load into transport:
      if (unitInPosition.type !== unit.type) {
        if (!("loadedUnit" in unitInPosition)) {
          throw badRequest(
            "Move action ending position is overlapping with an allied unit"
          );
        }

        if (unitInPosition.loadedUnit !== null) {
          if (
            !("loadedUnit2" in unitInPosition) ||
            unitInPosition.loadedUnit2 !== null
          ) {
            throw badRequest("Transport already occupied");
          }
        }

        //check if unit can go into that transport
        switch (unitInPosition.type) {
          case "transportCopter":
          case "apc":
          case "blackBoat": {
            if (unit.type !== "infantry" && unit.type !== "mech") {
              throw badRequest(
                "Can't load non-soldier in apc / transport / black boat"
              );
            }
            break;
          }
          case "lander": {
            if (unitPropertiesMap[unit.type].facility !== "base") {
              throw badRequest("Can't load non-land unit to lander");
            }
            break;
          }
          case "cruiser": {
            if (
              unit.type !== "transportCopter" &&
              unit.type !== "battleCopter"
            ) {
              throw badRequest("Can't load non-copter in cruiser");
            }
            break;
          }
          case "carrier": {
            if (unitPropertiesMap[unit.type].facility !== "airport") {
              throw badRequest("Can't load non-land unit to lander");
            }
            break;
          }
        }
      }
    }

    result.path.push(action.path[i]);
  }

  return result;
};
