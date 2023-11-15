import { SubActionToEvent } from "../../routers/action";
import { LaunchMissileAction } from "../../schemas/action";
import {
  getUnitAtPosition,
  isOutsideOfMap,
} from "../../../shared/match-logic/positions";
import { TRPCError } from "@trpc/server";
import { throwIfUnitNotOwned, throwMessage } from "./trpc-error-manager";
import { getCurrentTile } from "../../../shared/match-logic/get-current-tile";

export const launchMissileActionToEvent: SubActionToEvent<
  LaunchMissileAction
> = ({ currentPlayer, action, matchState, fromPosition }) => {
  const unit = getUnitAtPosition(matchState, fromPosition);

  const tile = getCurrentTile(matchState, fromPosition);

  if (tile.type !== "unusedSilo")
    throwMessage("This tile is not an unused missile silo");

  if (unit === null) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No unit found at specified position",
    });
  }
  throwIfUnitNotOwned(unit, currentPlayer.slot);

  if (unit.type !== "infantry" && unit.type !== "mech")
    throwMessage("Trying to launch a missile with a non valid unit type");

  if (isOutsideOfMap(matchState.map, action.targetPosition))
    throwMessage("Trying to launch a missile in a position outside of map");

  return action;
};
