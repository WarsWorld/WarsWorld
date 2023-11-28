import { DispatchableError } from "shared/DispatchedError";
import type { AbilityAction } from "shared/schemas/action";
import { allDirections } from "shared/schemas/direction";
import type { MatchWrapper } from "shared/wrappers/match";
import type { UnitWrapper } from "shared/wrappers/unit";
import { addDirection } from "../../positions";
import type { SubActionToEvent } from "../handler-types";

/* TODO transfer property ownership on HQ capture */

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

export const applyAbilityEvent = (match: MatchWrapper, unit: UnitWrapper) => {
  switch (unit.data.type) {
    case "infantry":
    case "mech": {
      //capture tile

      // TODO sami

      if (!("currentCapturePoints" in unit.data)) {
        // theoretically this check should never be positive, but
        // TS has issues narrowing UnitWithHiddenStats
        break;
      }

      if (unit.data.currentCapturePoints === undefined) {
        unit.data.currentCapturePoints = 20;
      }

      unit.data.currentCapturePoints -= unit.getHP();

      if (unit.data.currentCapturePoints <= 0) {
        unit.data.currentCapturePoints = undefined;

        const tile = unit.getTileOrThrow();

        if (!("playerSlot" in tile)) {
          throw new Error(
            `Could not capture tile at ${JSON.stringify(
              unit.data.position
            )}: no playerSlot property! (Not changeable tile?)`
          );
        }

        tile.playerSlot = unit.data.playerSlot;
      }

      break;
    }
    case "apc": {
      //supply
      for (const dir of allDirections) {
        match.units.getUnit(addDirection(unit.data.position, dir))?.refuel();
      }

      break;
    }
    case "blackBomb": {
      match.units.damageUntil1HPInRadius({
        radius: 3,
        damageAmount: 50,
        epicenter: unit.data.position
      });
      unit.remove();
      break;
    }
    case "stealth":
    case "sub": {
      //toggle hide
      if ("hidden" in unit.data) {
        unit.data.hidden = !unit.data.hidden;
      }

      break;
    }
  }
};
