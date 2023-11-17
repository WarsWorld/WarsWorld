import { DispatchableError } from "shared/DispatchedError";
import type { LaunchMissileAction } from "shared/schemas/action";
import type { SubActionToEvent } from "server/routers/action";

export const launchMissileActionToEvent: SubActionToEvent<
  LaunchMissileAction
> = (match, action, fromPosition) => {
  const player = match.players.getCurrentTurnPlayer();
  const unit = player.getUnits().getUnitOrThrow(fromPosition);
  const tile = match.getTile(fromPosition);

  if (tile.type !== "unusedSilo") {
    throw new DispatchableError("This tile is not an unused missile silo");
  }

  if (unit.type !== "infantry" && unit.type !== "mech") {
    throw new DispatchableError(
      "Trying to launch a missile with a non valid unit type"
    );
  }

  match.map.throwIfOutOfBounds(action.targetPosition);

  return action;
};
