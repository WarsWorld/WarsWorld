import { addDirection } from "../../../shared/match-logic/positions";
import type { SubActionToEvent } from "../../routers/action";
import type { RepairAction } from "../../schemas/action";
import { badRequest } from "./trpc-error-manager";

export const repairActionToEvent: SubActionToEvent<RepairAction> = (
  match,
  action,
  fromPosition
) => {
  const player = match.players.getCurrentTurnPlayer();
  const unit = player.getUnits().getUnitOrThrow(fromPosition);

  if (unit.type !== "blackBoat") {
    throw badRequest("Trying to repair with a unit that is not a black boat");
  }

  const repairPosition = addDirection(fromPosition, action.direction);
  match.map.throwIfOutOfBounds(repairPosition);
  player.getUnits().getUnitOrThrow(repairPosition);

  return action;
};
