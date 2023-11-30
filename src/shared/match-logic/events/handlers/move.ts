import { DispatchableError } from "shared/DispatchedError";
import { unitPropertiesMap } from "shared/match-logic/buildable-unit";
import type { MoveAction } from "shared/schemas/action";
import { getFinalPositionSafe, isSamePosition } from "shared/schemas/position";
import type { UnitWithVisibleStats } from "shared/schemas/unit";
import type { MoveEvent } from "shared/types/events";
import type { MatchWrapper } from "shared/wrappers/match";
import { applySubEventToMatch } from "../apply-event-to-match";
import type { MainActionToEvent } from "../handler-types";

export const createNoMoveEvent = (): MoveEvent => ({
  type: "move",
  path: [],
  trap: false,
  subEvent: { type: "wait" }
});

export const moveActionToEvent: MainActionToEvent<MoveAction> = (
  match,
  action
) => {
  const player = match.getCurrentTurnPlayer();
  const unit = match.getUnitOrThrow(action.path[0]);

  if (!player.owns(unit)) {
    throw new DispatchableError("You don't own this unit")
  }

  if (!unit.data.isReady) {
    throw new DispatchableError("Trying to move a waited unit");
  }

  const result = createNoMoveEvent();

  let remainingMovePoints = unit.getMovementPoints();

  const fuelNeeded = action.path.length - 1;

  if (unit.getFuel() < fuelNeeded) {
    throw new DispatchableError("Not enough fuel for this move");
  }

  for (let pathIndex = 0; pathIndex < action.path.length; ++pathIndex) {
    const position = action.path[pathIndex];

    match.map.throwIfOutOfBounds(position);

    const moveCost = match.getMovementCost(position, unit.data.type);

    if (moveCost === null) {
      throw new DispatchableError("Cannot move to a desired position");
    }

    if (result.path.find((pos) => isSamePosition(pos, position))) {
      throw new DispatchableError(
        "The given path passes through the same position twice"
      );
    }

    const unitInPosition = match.getUnit(position);

    if (unitInPosition?.data.playerSlot === unit.data.playerSlot) {
      result.trap = true;
      break;
    }

    if (moveCost > remainingMovePoints) {
      throw new DispatchableError("Using more move points than available");
    }

    remainingMovePoints -= moveCost;

    if (
      pathIndex === action.path.length - 1 &&
      unitInPosition !== undefined &&
      unitInPosition.data.playerSlot === unit.data.playerSlot
    ) {
      // if this is false, indicates join, which is always valid because then
      // the final position unit is by the same player and unit type.
      const indicateLoadingUnit = unitInPosition.data.type !== unit.data.type;

      if (indicateLoadingUnit) {
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

    result.path.push(action.path[pathIndex]);
  }

  return result;
};

const loadUnitInto = (
  unitToLoad: UnitWithVisibleStats,
  transportUnit: UnitWithVisibleStats
) => {
  switch (transportUnit.type) {
    case "transportCopter":
    case "apc": {
      if (unitToLoad.type === "infantry" || unitToLoad.type === "mech") {
        transportUnit.loadedUnit = unitToLoad;
      }

      break;
    }
    case "blackBoat": {
      if (unitToLoad.type === "infantry" || unitToLoad.type === "mech") {
        if (transportUnit.loadedUnit === null) {
          transportUnit.loadedUnit = unitToLoad;
        } else {
          transportUnit.loadedUnit2 = unitToLoad;
        }
      }

      break;
    }
    case "lander": {
      if (
        unitToLoad.type === "infantry" ||
        unitToLoad.type === "mech" ||
        unitToLoad.type === "recon" ||
        unitToLoad.type === "apc" ||
        unitToLoad.type === "artillery" ||
        unitToLoad.type === "tank" ||
        unitToLoad.type === "antiAir" ||
        unitToLoad.type === "missile" ||
        unitToLoad.type === "rocket" ||
        unitToLoad.type === "mediumTank" ||
        unitToLoad.type === "neoTank" ||
        unitToLoad.type === "megaTank"
      ) {
        if (transportUnit.loadedUnit === null) {
          transportUnit.loadedUnit = unitToLoad;
        } else {
          transportUnit.loadedUnit2 = unitToLoad;
        }
      }

      break;
    }
    case "cruiser": {
      if (
        unitToLoad.type === "transportCopter" ||
        unitToLoad.type === "battleCopter"
      ) {
        if (transportUnit.loadedUnit === null) {
          transportUnit.loadedUnit = unitToLoad;
        } else {
          transportUnit.loadedUnit2 = unitToLoad;
        }
      }

      break;
    }
    case "carrier": {
      if (
        unitToLoad.type === "transportCopter" ||
        unitToLoad.type === "battleCopter" ||
        unitToLoad.type === "fighter" ||
        unitToLoad.type === "bomber" ||
        unitToLoad.type === "blackBomb" ||
        unitToLoad.type === "stealth"
      ) {
        if (transportUnit.loadedUnit === null) {
          transportUnit.loadedUnit = unitToLoad;
        } else {
          transportUnit.loadedUnit2 = unitToLoad;
        }
      }
    }
  }
};

export const applyMoveEvent = (match: MatchWrapper, event: MoveEvent) => {
  //check if unit is moving or just standing still
  if (event.path.length <= 1) {
    applySubEventToMatch(match, event);
    return;
  }

  const unit = match.getUnitOrThrow(event.path[0]);

  //if unit was capturing, interrupt capture
  if ("currentCapturePoints" in unit) {
    const tile = unit.getTile();

    if ("captureHP" in tile) {
      tile.captureHP = 20;
    }

    unit.currentCapturePoints = undefined;
  }

  unit.drainFuel(event.path.length - 1);

  const unitAtDestination = match.getUnit(
    getFinalPositionSafe(event.path)
  );

  if (unitAtDestination === undefined) {
    unit.data.position = getFinalPositionSafe(event.path);
  } else {
    if (unit.data.type === unitAtDestination.data.type) {
      //join (hp, fuel, ammo, (keep capture points))
      const unitProperties = unitPropertiesMap[unit.data.type];

      // TODO calculate fund gains when joined HP would have been above 10

      unitAtDestination.setFuel(
        Math.min(
          unit.getFuel() + unitAtDestination.getFuel(),
          unitProperties.initialFuel
        )
      );

      unitAtDestination.setHp(unit.getHP() + unitAtDestination.getHP());

      const newAmmo =
        (unit.getAmmo() ?? 0) + (unitAtDestination.getAmmo() ?? 0);

      unitAtDestination.setAmmo(newAmmo);
    } else if (
      unit.data.stats !== "hidden" &&
      unitAtDestination.data.stats !== "hidden"
    ) {
      loadUnitInto(unit.data, unitAtDestination.data);
    }

    unit.remove();
  }

  applySubEventToMatch(match, event);
};
