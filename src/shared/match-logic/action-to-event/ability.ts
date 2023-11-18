import { DispatchableError } from "shared/DispatchedError";
import type { AbilityAction } from "shared/schemas/action";
import type { SubActionToEvent } from "server/routers/action";

//Capture, APC supply, black bomb explosion, toggle stealth/sub hide.
export const abilityActionToEvent: SubActionToEvent<AbilityAction> = (
  match,
  action,
  fromPosition
) => {
  const player = match.players.getCurrentTurnPlayer();
  const unit = player.getUnits().getUnitOrThrow(fromPosition);

  switch (unit.data.type) {
    case "infantry":
    case "mech": {
      const tile = match.getTile(fromPosition);

      if (!("playerSlot" in tile) || tile.playerSlot === unit.data.playerSlot) {
        throw new DispatchableError("This tile can not be captured");
      }

      break;
    }
    case "apc":
    case "blackBomb":
    case "stealth":
    case "sub":
      break;
    default:
      throw new DispatchableError("This unit does not have an ability");
  }

  return action;
};
