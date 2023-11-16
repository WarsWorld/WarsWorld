import type { SubActionToEvent } from "../../routers/action";
import type { AbilityAction } from "../../schemas/action";
import { badRequest } from "./trpc-error-manager";

//Capture, APC supply, black bomb explosion, toggle stealth/sub hide.
export const abilityActionToEvent: SubActionToEvent<AbilityAction> = ({
  currentPlayer,
  action,
  matchState,
  fromPosition,
}) => {
  const unit = currentPlayer.getUnits().getUnitOrThrow(fromPosition);

  switch (unit.type) {
    case "infantry":
    case "mech": {
      const tile = matchState.getTile(fromPosition);

      if (!("playerSlot" in tile) || tile.playerSlot === unit.playerSlot) {
        throw badRequest("This tile can not be captured");
      }

      break;
    }
    case "apc":
    case "blackBomb":
    case "stealth":
    case "sub":
      break;
    default:
      throw badRequest("This unit does not have an ability");
  }

  return action;
};
