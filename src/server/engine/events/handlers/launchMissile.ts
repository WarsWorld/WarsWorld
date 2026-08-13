import { DispatchableError } from "server/engine/DispatchedError";
import type { LaunchMissileAction } from "server/core/schemas/action";
import type { Position } from "server/core/schemas/position";
import type { LaunchMissileEvent } from "server/engine/types/events";
import type { MatchWrapper } from "server/engine/entities/match";
import type { SubActionToEvent } from "server/engine/events/handler-types";

export const launchMissileActionToEvent: SubActionToEvent<LaunchMissileAction> = (
  match,
  action,
  fromPosition,
) => {
  const player = match.getCurrentTurnPlayer();

  const unit = match.getUnitOrThrow(fromPosition);

  if (!player.owns(unit)) {
    throw new DispatchableError("You don't own this unit");
  }

  const tile = match.getTile(fromPosition);

  if (tile.type !== "unusedSilo" || !("fired" in tile)) {
    throw new DispatchableError("This tile is not a missile silo");
  }

  if (tile.fired) {
    throw new DispatchableError("Trying to fire a missile from a used silo tile");
  }

  if (unit.data.type !== "infantry" && unit.data.type !== "mech") {
    throw new DispatchableError("Trying to launch a missile with a non valid unit type");
  }

  match.map.throwIfOutOfBounds(action.targetPosition);

  return action;
};

export const applyLaunchMissileEvent = (
  match: MatchWrapper,
  event: LaunchMissileEvent,
  fromPosition: Position,
) => {
  const siloTile = match.getTile(fromPosition);

  if (!("fired" in siloTile)) {
    throw new Error(
      `Could not update missile silo fired state at ${JSON.stringify(
        fromPosition,
      )}: no fired property! (Not changeable tile?)`,
    );
  }

  siloTile.fired = true;

  match.damageUntil1HPInRadius({
    radius: 2,
    visualHpAmount: 3,
    epicenter: event.targetPosition,
  });
};
