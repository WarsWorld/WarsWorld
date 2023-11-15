import { SubActionToEvent } from "../../routers/action";
import { RepairAction } from "../../schemas/action";
import {
  addDirection,
  getUnitAtPosition,
  isOutsideOfMap,
} from "../../../shared/match-logic/positions";
import { TRPCError } from "@trpc/server";
import { throwIfUnitNotOwned, throwMessage } from "./trpc-error-manager";

export const repairActionToEvent: SubActionToEvent<RepairAction> = ({
  currentPlayer,
  action,
  matchState,
  fromPosition,
}) => {
  const unit = getUnitAtPosition(matchState, fromPosition);

  if (unit === null) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No unit found at specified position",
    });
  }
  throwIfUnitNotOwned(unit, currentPlayer.slot);

  if (unit.type !== "blackBoat")
    throwMessage("Trying to repair with a unit that is not a black boat");

  const repairPosition = addDirection(fromPosition, action.direction);
  if (isOutsideOfMap(matchState.map, repairPosition))
    throwMessage("Trying to repair in a position outside of map");

  const repairedUnit = getUnitAtPosition(matchState, repairPosition);
  if (repairedUnit === null) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No unit found at specified repair position",
    });
  }
  if (repairedUnit.playerSlot !== unit.playerSlot)
    throwMessage("Trying to repair a unit that is not owned");

  return action;
};
