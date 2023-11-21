import type { MoveAction } from "shared/schemas/action";
import { unitPropertiesMap } from "shared/match-logic/buildable-unit";
import type { MoveEvent } from "shared/types/events";
import { getFinalPositionSafe, isSamePosition } from "shared/schemas/position";
import { DispatchableError } from "shared/DispatchedError";
import type { MatchWrapper } from "shared/wrappers/match";
import type { WWUnit } from "shared/schemas/unit";
import { validateSubActionAndToEvent } from "../action-to-event";
import type { MainActionToEvent } from "../handler-types";

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

  let remainingMovePoints = unit.getMovementPoints();

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

  /** TODO not sure if this is correct */
  result.subEvent = validateSubActionAndToEvent(
    match,
    action.subAction,
    getFinalPositionSafe(result.path)
  );

  return result;
};

const loadUnitInto = (unitToLoad: WWUnit, transportUnit: WWUnit) => {
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
  const player = match.players.getCurrentTurnPlayer();

  //check if unit is moving or just standing still
  if (event.path.length <= 1) {
    return;
  }

  const unit = match.units.getUnitOrThrow(event.path[0]);

  //if unit was capturing, interrupt capture
  if ("currentCapturePoints" in unit) {
    unit.currentCapturePoints = undefined;
  }

  unit.data.stats.fuel -=
    (event.path.length - 1) *
    player.getCOHooksWithUnit(event.path[0]).onFuelCost(1);

  const unitAtDestination = match.units.getUnit(
    event.path[event.path.length - 1]
  );

  if (unitAtDestination === undefined) {
    unit.data.position = event.path[event.path.length - 1];
  } else {
    if (unit.data.type === unitAtDestination.data.type) {
      //join (hp, fuel, ammo, (keep capture points))
      const unitProperties = unitPropertiesMap[unit.data.type];
      unitAtDestination.data.stats.fuel = Math.min(
        unit.data.stats.fuel + unitAtDestination.data.stats.fuel,
        unitProperties.initialFuel
      );
      unitAtDestination.data.stats.hp = Math.min(
        unit.data.stats.hp + unitAtDestination.data.stats.hp,
        99
      );

      if (
        "ammo" in unit.data.stats &&
        "ammo" in unitAtDestination.data.stats &&
        "initialAmmo" in unitProperties
      ) {
        unitAtDestination.data.stats.ammo = Math.min(
          unit.data.stats.ammo + unitAtDestination.data.stats.ammo,
          unitProperties.initialAmmo
        );
      }

      match.units.removeUnit(unit);
    } else {
      //load
      loadUnitInto(unit.data, unitAtDestination.data);
      match.units.removeUnit(unit);
    }
  }
};
