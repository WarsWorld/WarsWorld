import type { SubActionToEvent } from "../../routers/action";
import type { LaunchMissileAction } from "../../schemas/action";
import { badRequest } from "./trpc-error-manager";

export const launchMissileActionToEvent: SubActionToEvent<
  LaunchMissileAction
> = ({ currentPlayer, action, matchState, fromPosition }) => {
  const unit = currentPlayer.getUnits().getUnitOrThrow(fromPosition);
  const tile = matchState.getTile(fromPosition);

  if (tile.type !== "unusedSilo") {
    throw badRequest("This tile is not an unused missile silo");
  }

  if (unit.type !== "infantry" && unit.type !== "mech") {
    throw badRequest("Trying to launch a missile with a non valid unit type");
  }

  matchState.map.throwIfOutOfBounds(action.targetPosition);
  return action;
};
