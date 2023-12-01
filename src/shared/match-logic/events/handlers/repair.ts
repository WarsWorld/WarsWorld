import { DispatchableError } from "shared/DispatchedError";
import type { RepairAction } from "shared/schemas/action";
import { addDirection } from "shared/schemas/position";
import type { MatchWrapper } from "shared/wrappers/match";
import type { RepairEvent } from "shared/types/events";
import type { Position } from "shared/schemas/position";
import { unitPropertiesMap } from "../../buildable-unit";
import type { SubActionToEvent } from "../handler-types";
import { getVisualHPfromHP } from "shared/match-logic/calculate-damage/calculate-damage";

export const repairActionToEvent: SubActionToEvent<RepairAction> = (
  match,
  action,
  fromPosition
) => {
  const player = match.getCurrentTurnPlayer();
  const unit = match.getUnitOrThrow(fromPosition);

  if (!player.owns(unit)) {
    throw new DispatchableError("You don't own this unit")
  }

  // TESTED: if trying to repair but no funds, unit will get resupplied but not repaired

  if (unit.data.type !== "blackBoat") {
    throw new DispatchableError(
      "Trying to repair with a unit that is not a black boat"
    );
  }

  const repairPosition = addDirection(fromPosition, action.direction);
  match.map.throwIfOutOfBounds(repairPosition);

  const repairedUnit = match.getUnitOrThrow(repairPosition);

  if (!player.owns(repairedUnit)) {
    throw new DispatchableError("You don't own the repaired unit")
  }

  return action;
};

export const applyRepairEvent = (
  match: MatchWrapper,
  event: RepairEvent,
  fromPosition: Position
) => {
  const player = match.getCurrentTurnPlayer();

  const repairedUnit = match.getUnitOrThrow(
    addDirection(fromPosition, event.direction)
  );

  repairedUnit.resupply();

  //heal for free if visual hp is 10
  if (getVisualHPfromHP(repairedUnit.getHP()) === 10) {
    repairedUnit.heal(10);
  } else {
    //check if enough funds for heal, and heal if it's the case
    const repairCost = repairedUnit.getBuildCost() / 10;

    if (repairCost <= player.data.funds) {
      repairedUnit.heal(10);
      player.data.funds -= repairCost;
    }
  }
};
