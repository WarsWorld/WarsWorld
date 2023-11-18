import type { MainActionToEvent } from "server/routers/action";
import type { MoveAction } from "shared/schemas/action";
import { unitPropertiesMap } from "shared/match-logic/buildable-unit";
import type { MoveEvent } from "shared/types/events";
import { isSamePosition } from "shared/schemas/position";
import { DispatchableError } from "shared/DispatchedError";

export const createNoMoveEvent = (): MoveEvent => ({
  type: "move",
  path: [],
  trap: false,
  subEvent: { type: "wait" },
});

export const moveActionToEvent: MainActionToEvent<MoveAction> = (
  match,
  action
) => {
  const player = match.players.getCurrentTurnPlayer();
  const unit = player.getUnits().getUnitOrThrow(action.path[0]);

  if (!unit.data.isReady) {
    throw new DispatchableError("Trying to move a waited unit");
  }

  const result = createNoMoveEvent();

  let remainingMovePoints = player.getMovementPoints(unit.data);

  const fuelNeeded =
    (action.path.length - 1) *
    player.getCOHooksWithUnit(action.path[0]).onFuelCost(1);

  if (unit.data.stats.fuel < fuelNeeded) {
    throw new DispatchableError("Not enough fuel for this move");
  }

  for (let i = 0; i < action.path.length; ++i) {
    const position = action.path[i];

    match.map.throwIfOutOfBounds(position);

    const moveCost = match.getMovementCost(
      position,
      unitPropertiesMap[unit.data.type].movementType
    );

    if (moveCost === null) {
      throw new DispatchableError("Cannot move to a desired position");
    }

    if (result.path.find((pos) => isSamePosition(pos, position))) {
      throw new DispatchableError(
        "The given path passes through the same position twice"
      );
    }

    const unitInPosition = match.units.getUnit(position);

    if (unitInPosition?.data.playerSlot === unit.data.playerSlot) {
      result.trap = true;
      break;
    }

    if (moveCost > remainingMovePoints) {
      throw new DispatchableError("Using more move points than available");
    }

    remainingMovePoints -= moveCost;

    if (
      i === action.path.length - 1 &&
      unitInPosition !== undefined &&
      unitInPosition.data.type !== unit.data.type
    ) {
      //check if trying to join (same unit type) or load into transport:
      if (unitInPosition.data.type !== unit.data.type) {
        if (!("loadedUnit" in unitInPosition)) {
          throw new DispatchableError(
            "Move action ending position is overlapping with an allied unit"
          );
        }

        if (unitInPosition.loadedUnit !== null) {
          if (
            !("loadedUnit2" in unitInPosition) ||
            unitInPosition.loadedUnit2 !== null
          ) {
            throw new DispatchableError("Transport already occupied");
          }
        }

        //check if unit can go into that transport
        switch (unitInPosition.data.type) {
          case "transportCopter":
          case "apc":
          case "blackBoat": {
            if (unit.data.type !== "infantry" && unit.data.type !== "mech") {
              throw new DispatchableError(
                "Can't load non-soldier in apc / transport / black boat"
              );
            }

            break;
          }
          case "lander": {
            if (unitPropertiesMap[unit.data.type].facility !== "base") {
              throw new DispatchableError("Can't load non-land unit to lander");
            }

            break;
          }
          case "cruiser": {
            if (
              unit.data.type !== "transportCopter" &&
              unit.data.type !== "battleCopter"
            ) {
              throw new DispatchableError("Can't load non-copter in cruiser");
            }

            break;
          }
          case "carrier": {
            if (unitPropertiesMap[unit.data.type].facility !== "airport") {
              throw new DispatchableError("Can't load non-land unit to lander");
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
