import { TRPCError } from "@trpc/server";
import type { MainActionToEvent } from "server/routers/action";
import type { MoveAction } from "server/schemas/action";
import { unitPropertiesMap } from "shared/match-logic/buildable-unit";
import type { MoveEvent } from "../../../shared/types/events";
import {
  badRequest,
  throwIfUnitIsWaited,
  throwMessage,
} from "./trpc-error-manager";

//TODO: check load!!!
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
  throwIfUnitIsWaited(unit);

  const result = createNoMoveEvent();

  let remainingMovePoints = currentPlayer.getMovementPoints(unit);

  const fuelNeeded =
    action.path.length *
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

    const unitInPosition = matchState.units.getUnit(position);

    if (unitInPosition?.playerSlot === unit.playerSlot) {
      result.trap = true;
      break;
    }

    if (moveCost > remainingMovePoints) {
      throw badRequest("Using more move points than available");
    }

    remainingMovePoints -= moveCost;

    const isFinalPosition = i === action.path.length - 1;

    if (
      isFinalPosition &&
      unitInPosition !== undefined &&
      unitInPosition.type !== unit.type
    ) {
      //check if trying to join or load into transport:
      if (unitInPosition.type !== unit.type) {
        if (!("loadedUnit" in unitInPosition)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Move action ending position is overlapping with an allied unit",
          });
        }

        if (unitInPosition.loadedUnit !== null) {
          if (
            !("loadedUnit2" in unitInPosition) ||
            unitInPosition.loadedUnit2 !== null
          ) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Transport already occupied",
            });
          }
        }

        if (unitInPosition.type === "cruiser") {
          console.log("");
        }

        //check if unit can go into that transport
        switch (unitInPosition.type) {
          case "cruiser": {
            if (unit.type !== "transportCopter" && unit.type !== "battleCopter")
              throwMessage("Can't load non-copter in cruiser");
            break;
          }
          case "carrier": {
            if (unitPropertiesMap[unit.type].facility !== "airport")
              throwMessage("Can't load non-land unit to lander");
            break;
          }
          case "transportCopter":
          case "apc":
          case "blackBoat": {
            if (unit.type !== "infantry" && unit.type !== "mech")
              throwMessage("Can't load non-soldier in apc/transport/blackB");
            break;
          }
          case "lander": {
            if (unitPropertiesMap[unit.type].facility !== "base")
              throwMessage("Can't load non-land unit to lander");
            break;
          }

          default: {
            unit;
            throw new Error("xd");
          }
        }
      }
    }

    result.path.push(action.path[i]);
  }

  return result;
};
