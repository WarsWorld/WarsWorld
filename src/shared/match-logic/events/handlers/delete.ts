import type { MainActionToEvent } from "../handler-types";
import type { DeleteAction } from "../../../schemas/action";
import { DispatchableError } from "../../../DispatchedError";
import type { MatchWrapper } from "../../../wrappers/match";
import type { DeleteEvent } from "../../../types/events";

export const deleteActionToEvent: MainActionToEvent<DeleteAction> = (
  match,
  action
) => {
  const player = match.getCurrentTurnPlayer();
  
  const deletedUnit = match.getUnit(action.position);
  
  if (deletedUnit === undefined) {
    throw new DispatchableError("No unit to delete was selected");
  }

  if (deletedUnit.data.playerSlot !== player.data.slot) {
    throw new DispatchableError("You don't own this unit");
  }
  
  if (player.getUnits().length <= 1) {
    return {
      ...action,
      eliminationReason: "all-units-destroyed"
    };
  } else {
    return action;
  }
};


export const applyDeleteEvent = (match: MatchWrapper, event: DeleteEvent) => {
  match.getUnit(event.position)?.remove();
};
