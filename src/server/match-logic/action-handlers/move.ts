import { ActionHandler } from "server/routers/action";
import { MoveAction } from "server/schemas/action";
import {
  Path,
  Position,
  positionsAreNeighbours,
} from "server/schemas/position";
import { unitPropertiesMap } from "shared/match-logic/buildable-unit";
import { getMovementCost } from "shared/match-logic/tiles";
import { throwIfUnitIsWaited } from "./move-utilities";

export const handleMoveAction: ActionHandler<MoveAction> = ({
  currentPlayer,
  action,
  matchState,
}) => {
  const unit = currentPlayer.getUnits().getUnitOrThrow(action.path[0]);
  throwIfUnitIsWaited(unit);

  if (
    unit.stats.fuel <
    action.path.length * currentPlayer.getCOHooks(action.path[0]).onFuelCost(1)
  ) {
    throw new Error("Not enough fuel for this move");
  }

  // check every tile of path for can-move-here, tracking movement points, handle traps
  let movementPoints = currentPlayer.getMovementPoints(unit);
  let previousPosition: Position | null = null;
  const travelledPath: Path = [];
  let trap = false;

  for (const nextPosition of action.path) {
    if (
      previousPosition !== null &&
      !positionsAreNeighbours(previousPosition, nextPosition)
    ) {
      const posA = JSON.stringify(previousPosition);
      const posB = JSON.stringify(nextPosition);
      throw new Error(`No jumps allowed! PosA: ${posA}, PosB: ${posB}`);
    }

    const nextTile = matchState.getTile(nextPosition);

    const movementCost = getMovementCost(
      nextTile.type,
      unitPropertiesMap[unit.type].movementType,
      matchState.currentWeather
    );

    if (movementCost === null) {
      throw new Error("Can't move unit [through] here (impassable)");
    }

    if (movementCost > movementPoints) {
      throw new Error(
        "Not enough movement points for this move (out of range)"
      );
    }

    if (currentPlayer.getEnemyUnits().hasUnit(nextPosition)) {
      trap = true;
      break;
    }

    travelledPath.push(nextPosition);
    movementPoints -= movementCost;
    previousPosition = nextPosition;
  }

  unit.stats.fuel -= action.path.length;

  if (matchState.units.hasUnit(action.path.at(-1)!)) {
    throw new Error("There's already a unit on the final position");
  }

  return {
    type: "move",
    path: travelledPath,
    trap,
    subAction: {
      type: "wait",
      /** TODO other subactions */
    },
  };
};
