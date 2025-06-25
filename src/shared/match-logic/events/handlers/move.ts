import { DispatchableError } from "shared/DispatchedError";
import { unitPropertiesMap } from "shared/match-logic/game-constants/unit-properties";
import type { MoveAction } from "shared/schemas/action";
import { getFinalPositionSafe, isSamePosition } from "shared/schemas/position";
import type { UnitWithVisibleStats } from "shared/schemas/unit";
import type { MoveEventWithoutSubEvent, MoveEventWithSubEvent } from "shared/types/events";
import type { MatchWrapper } from "shared/wrappers/match";
import type { UnitWrapper } from "../../../wrappers/unit";

// we don't use MainActionToEvent here because MoveEvent is special
// because at this point we don't have the subEvent yet
// which MainActionToEvent requires.
export const moveActionToEvent = (
  match: MatchWrapper,
  action: MoveAction,
): MoveEventWithoutSubEvent => {
  const [unitPosition, ...path] = action.path;
  const player = match.getCurrentTurnPlayer();
  const unit = match.getUnitOrThrow(unitPosition);

  if (!player.owns(unit)) {
    throw new DispatchableError("You don't own this unit");
  }

  console.log("Unit trying to move:", unit.data);

  if (!unit.data.isReady) {
    throw new DispatchableError("Trying to move a waited unit");
  }

  const result: MoveEventWithoutSubEvent = {
    type: "move",
    path: [],
    trap: false,
  };

  //Unit is waiting in-place if it's path is only the starting tile
  if (action.path.length === 1) {
    result.path.push(action.path[0]);

    return result;
  }

  let remainingMovePoints = unit.getMovementPoints();

  if (unit.getFuel() < path.length) {
    // TODO isn't there AWDS weather or something that makes units burn >1 fuel per tile?
    throw new DispatchableError("Not enough fuel for this move");
  }

  for (let pathIndex = 0; pathIndex < action.path.length; ++pathIndex) {
    const position = action.path[pathIndex];

    match.map.throwIfOutOfBounds(position);

    let moveCost = unit.getMovementCost(position);

    //It costs 0 points to move out of starting tile, our path[0] is the starting tile so we should not count it for movement
    if (pathIndex === 0) {
      moveCost = 0;
    }

    if (moveCost === null) {
      throw new DispatchableError("Cannot move to a desired position");
    }

    if (result.path.find((pos) => isSamePosition(pos, position))) {
      throw new DispatchableError("The given path passes through the same position twice");
    }

    const unitInPosition = match.getUnit(position);

    if (unitInPosition !== undefined && unitInPosition?.data.playerSlot !== unit.data.playerSlot) {
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
      throwIfCantMoveIntoUnit(unit, unitInPosition);

      if (unitInPosition.data.type === unit.data.type) {
        //join, calculate gained funds
        const newVisualHP = unit.getVisualHP() + unitInPosition.getVisualHP();

        if (newVisualHP > 10) {
          result.fundsGained = (unit.getBuildCost() / 10) * (newVisualHP - 10);
        }
      }
    }

    result.path.push(action.path[pathIndex]);
  }

  return result;
};

export const throwIfCantMoveIntoUnit = (unit: UnitWrapper, unitInPosition: UnitWrapper) => {
  if (unitInPosition.data.type === unit.data.type) {
    // trying to join (same unit type)
    // join logic: if neither unit has loaded units, and the unit at join destination is not 10 hp
    if (unitInPosition.getVisualHP() === 10) {
      throw new DispatchableError("Trying to join into a unit at full hp");
    }

    if ("loadedUnit" in unitInPosition.data && unitInPosition.data.loadedUnit !== null) {
      throw new DispatchableError("Trying to join into a unit that has a loaded unit");
    }

    if ("loadedUnit" in unit && unit.loadedUnit !== null) {
      throw new DispatchableError("Trying to join while having a unit loaded");
    }
  } else {
    // trying to load (different unit type)
    if (!("loadedUnit" in unitInPosition.data)) {
      throw new DispatchableError("Move action ending position is overlapping with an allied unit");
    }

    if (
      unitInPosition.data.loadedUnit !== null &&
      (!("loadedUnit2" in unitInPosition.data) || unitInPosition.data.loadedUnit2 !== null)
    ) {
      throw new DispatchableError("Transport already occupied");
    }

    //check if unit can go into that transport
    switch (unitInPosition.data.type) {
      case "transportCopter":
      case "apc":
      case "blackBoat": {
        if (unit.data.type !== "infantry" && unit.data.type !== "mech") {
          throw new DispatchableError("Can't load non-soldier in apc / transport / black boat");
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
        if (unit.data.type !== "transportCopter" && unit.data.type !== "battleCopter") {
          throw new DispatchableError("Can't load non-copter in cruiser");
        }

        break;
      }
      case "carrier": {
        if (unitPropertiesMap[unit.data.type].facility !== "airport") {
          throw new DispatchableError("Can't load non-air unit to carrier");
        }

        break;
      }
    }
  }
};

const loadUnitInto = (unitToLoad: UnitWithVisibleStats, transportUnit: UnitWithVisibleStats) => {
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
      if (unitToLoad.type === "transportCopter" || unitToLoad.type === "battleCopter") {
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

const getOneTileFuelCost = (match: MatchWrapper, unit: UnitWrapper): number => {
  const gameVersion = match.rules.gameVersion ?? unit.player.data.coId.version;

  if (
    gameVersion === "AWDS" &&
    match.getCurrentWeather() === "snow" &&
    unit.player.data.coId.name !== "olaf"
  ) {
    return 2;
  }

  return 1;
};

export const applyMoveEvent = (match: MatchWrapper, event: MoveEventWithoutSubEvent) => {
  //check if unit is moving or just standing still
  if (event.path.length <= 1) {
    return;
  }

  const unit = match.getUnitOrThrow(event.path[0]);

  unit.data.isReady = false;

  //if unit was capturing, interrupt capture
  if ("currentCapturePoints" in unit.data) {
    unit.data.currentCapturePoints = undefined;
  }

  unit.drainFuel((event.path.length - 1) * getOneTileFuelCost(match, unit));
  const unitAtDestination = match.getUnit(getFinalPositionSafe(event.path));

  if (unitAtDestination === undefined) {
    unit.data.position = getFinalPositionSafe(event.path);
  } else {
    if (unit.data.type === unitAtDestination.data.type) {
      //join (hp, fuel, ammo, (keep capture points))
      unitAtDestination.setFuel(unit.getFuel() + unitAtDestination.getFuel());

      // yes, this "generates" hp, but it's how it works in game
      const newVisualHP = unit.getVisualHP() + unitAtDestination.getVisualHP();

      //gain funds
      if (event.fundsGained !== undefined) {
        unit.player.data.funds += event.fundsGained;
      }

      unitAtDestination.setHp(Math.min(newVisualHP, 10) * 10);

      const newAmmo = (unit.getAmmo() ?? 0) + (unitAtDestination.getAmmo() ?? 0);

      unitAtDestination.setAmmo(newAmmo);
    } else if (unit.data.stats !== "hidden" && unitAtDestination.data.stats !== "hidden") {
      loadUnitInto(unit.data, unitAtDestination.data);
    }

    unit.remove();
  }
};

/**
 * Call this AFTER creating the sub event but BEFORE applying it
 */
export const updateMoveVision = (match: MatchWrapper, event: MoveEventWithSubEvent) => {
  if (event.path.length < 2) {
    // if didn't move no vision change
    return;
  }

  const movedUnit = match.getUnitOrThrow(getFinalPositionSafe(event.path));

  movedUnit.data.position = event.path[0]; // temporarily revert position
  movedUnit.player.team.vision?.removeUnitVision(movedUnit); // remove vision from previous position
  movedUnit.data.position = getFinalPositionSafe(event.path); // revert the reversion (xd)
  movedUnit.player.team.vision?.addUnitVision(movedUnit); // add vision from new position

  /*
  Small side note: attack event works fine with this if the attacker dies, since
  vision works by having how many units see a particular tile, and when a unit dies
  it subtracts one from that counter. so attack event subtracts from final position,
  and then move event adds back (so in the end the unit lost vision from previous
  position, but didn't gain vision from new position (- +)
   */
};
