import { DispatchableError } from "shared/DispatchedError";
import type { RepairAction } from "shared/schemas/action";
import type { SubActionToEvent } from "server/routers/action";
import { addDirection } from "../positions";

export const repairActionToEvent: SubActionToEvent<RepairAction> = (
  match,
  action,
  fromPosition
) => {
  const player = match.players.getCurrentTurnPlayer();
  const unit = player.getUnits().getUnitOrThrow(fromPosition);

  if (unit.type !== "blackBoat") {
    throw new DispatchableError(
      "Trying to repair with a unit that is not a black boat"
    );
  }

  const repairPosition = addDirection(fromPosition, action.direction);
  match.map.throwIfOutOfBounds(repairPosition);
  player.getUnits().getUnitOrThrow(repairPosition);

  return action;
};
