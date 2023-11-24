import { DispatchableError } from "shared/DispatchedError";
import type { RepairAction } from "shared/schemas/action";
import { addDirection } from "../../positions";
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
  const player = match.players.getCurrentTurnPlayer();
  const unit = player.getUnits().getUnitOrThrow(fromPosition);

  if (unit.data.type !== "blackBoat") {
    throw new DispatchableError(
      "Trying to repair with a unit that is not a black boat"
    );
  }

  const repairPosition = addDirection(fromPosition, action.direction);
  match.map.throwIfOutOfBounds(repairPosition);
  player.getUnits().getUnitOrThrow(repairPosition);

  return action;
};

export const applyRepairEvent = (
  match: MatchWrapper,
  event: RepairEvent,
  fromPosition: Position
) => {
  const player = match.players.getCurrentTurnPlayer();

  const repairedUnit = match.units.getUnitOrThrow(
    addDirection(fromPosition, event.direction)
  );

  repairedUnit.setStat(
    "fuel",
    unitPropertiesMap[repairedUnit.data.type].initialFuel
  );

  //heal for free if visual hp is 10
  if (getVisualHPfromHP(repairedUnit.getStat("hp")) === 10) {
    repairedUnit.heal(1);
  } else {
    //check if enough funds for heal, and heal if it's the case
    const unitCost = unitPropertiesMap[repairedUnit.data.type].cost;
    const modifiedCost = player.getHook("buildCost")?.(unitCost, match);
    const repairEffectiveCost = (modifiedCost ?? unitCost) * 0.1; // TODO what does this 0.1 factor do?

    if (repairEffectiveCost <= player.data.funds) {
      repairedUnit.heal(1);
      player.data.funds -= repairEffectiveCost;
    }
  }
};
