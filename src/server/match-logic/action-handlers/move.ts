import { ActionHandler } from "server/routers/action";
import { MoveAction } from "server/schemas/action";
import { PlayerSlot } from "server/schemas/player-slot";
import { Position, isSamePosition } from "server/schemas/position";
import { unitPropertiesMap } from "shared/match-logic/buildable-unit";
import { getCurrentTile } from "shared/match-logic/get-current-tile";
import { getUnit } from "shared/match-logic/positions";
import { getMovementCost } from "shared/match-logic/tiles";
import { getEnemyUnits } from "shared/match-logic/units";
import { BackendMatchState } from "shared/types/server-match-state";
import {
  getMovementRange as getMovementPoints,
  inflatePath,
  throwIfUnitIsWaited,
  throwIfUnitNotOwned,
} from "./move-utilities";

const isTileImpassable = (
  matchState: BackendMatchState,
  playerSlot: PlayerSlot,
  position: Position
) => {
  // if tile has pipe seam or something?
  // what other obstructions are there?
  return getEnemyUnits(matchState, playerSlot).some((u) =>
    isSamePosition(u.position, position)
  );
};

export const handleMoveAction: ActionHandler<MoveAction> = ({
  currentPlayer,
  action,
  matchState,
}) => {
  const unit = getUnit(matchState, action.path[0]); // TODO handle error and convert to TRPCError?

  throwIfUnitNotOwned(unit, currentPlayer.slot);
  throwIfUnitIsWaited(unit);

  // check every tile of path for can-move-here, tracking movement points, handle traps
  const inflatedPath = inflatePath(action.path);
  const movementPoints = getMovementPoints(unit, matchState, currentPlayer);

  inflatedPath.reduce((remainingMovementPoints, nextPosition) => {
    const nextTile = getCurrentTile(matchState, nextPosition);
    const movementCost = getMovementCost(
      nextTile.type,
      unitPropertiesMap[unit.type].movementType,
      matchState.currentWeather
    );

    const tileIsObstructed = isTileImpassable(
      matchState,
      currentPlayer.slot,
      nextPosition
    );

    if (movementCost === null || tileIsObstructed) {
      throw new Error("Can't move unit [through] here (impassable)");
    }

    if (remainingMovementPoints < movementCost) {
      throw new Error(
        "Not enough movement points for this move (out of range)"
      );
    }

    return remainingMovementPoints - movementCost;
  }, movementPoints);

  if (
    matchState.units.some((u) =>
      isSamePosition(u.position, inflatedPath.at(-1)!)
    )
  ) {
    throw new Error("There's already a unit on the final position");
  }
};
