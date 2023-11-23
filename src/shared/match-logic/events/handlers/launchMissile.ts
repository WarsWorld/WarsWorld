import { DispatchableError } from "shared/DispatchedError";
import type { LaunchMissileAction } from "shared/schemas/action";
import type { MatchWrapper } from "shared/wrappers/match";
import type { LaunchMissileEvent } from "shared/types/events";
import type { SubActionToEvent } from "../handler-types";

export const launchMissileActionToEvent: SubActionToEvent<
  LaunchMissileAction
> = (match, action, fromPosition) => {
  const player = match.players.getCurrentTurnPlayer();
  const unit = player.getUnits().getUnitOrThrow(fromPosition);
  const tile = match.getTile(fromPosition);

  if (tile.type !== "unusedSilo") {
    throw new DispatchableError("This tile is not an unused missile silo");
  }

  if (unit.data.type !== "infantry" && unit.data.type !== "mech") {
    throw new DispatchableError(
      "Trying to launch a missile with a non valid unit type"
    );
  }

  match.map.throwIfOutOfBounds(action.targetPosition);

  return action;
};

export const applyLaunchMissileEvent = (
  match: MatchWrapper,
  event: LaunchMissileEvent
) => {
  match.units.damageUntil1HPInRadius({
    radius: 3,
    damageAmount: 30,
    epicenter: event.targetPosition,
  });
};
