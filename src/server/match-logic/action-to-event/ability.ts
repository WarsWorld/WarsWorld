import type { SubActionToEvent } from "../../routers/action";
import type { AbilityAction } from "../../schemas/action";
import { badRequest } from "./trpc-error-manager";

//Capture, APC supply, black bomb explosion, toggle stealth/sub hide.
export const abilityActionToEvent: SubActionToEvent<AbilityAction> = (
  match,
  action,
  fromPosition
) => {
  const player = match.players.getCurrentTurnPlayer();
  const unit = player.getUnits().getUnitOrThrow(fromPosition);

  switch (unit.type) {
    case "infantry":
    case "mech": {
      const tile = match.getTile(fromPosition);

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

  return {
    ...action,
    playerSlot: player.data.slot,
  };
};
