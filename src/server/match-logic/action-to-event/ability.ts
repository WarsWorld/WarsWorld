import { SubActionToEvent } from "../../routers/action";
import { AbilityAction } from "../../schemas/action";
import { getUnitAtPosition } from "../../../shared/match-logic/positions";
import { TRPCError } from "@trpc/server";
import { throwIfUnitNotOwned, throwMessage } from "./trpc-error-manager";
import { getCurrentTile } from "../../../shared/match-logic/get-current-tile";

//Capture, APC supply, black bomb explosion, toggle stealth/sub hide.
export const abilityActionToEvent: SubActionToEvent<AbilityAction> = ({
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

  switch (unit.type) {
    case "infantry":
    case "mech": {
      const tile = getCurrentTile(matchState, fromPosition);
      if (!("playerSlot" in tile) || tile.playerSlot === unit.playerSlot)
        throwMessage("This tile can not be captured");
      break;
    }
    case "apc":
    case "blackBomb":
    case "stealth":
    case "sub":
      break;
    default:
      throwMessage("This unit does not have an ability");
  }

  return action;
};
