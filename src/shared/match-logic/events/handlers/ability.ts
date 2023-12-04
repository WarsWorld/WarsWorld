import { DispatchableError } from "shared/DispatchedError";
import type { AbilityAction } from "shared/schemas/action";
import { addDirection, allDirections } from "shared/schemas/position";
import type { MatchWrapper } from "shared/wrappers/match";
import type { UnitWrapper } from "shared/wrappers/unit";
import type { SubActionToEvent } from "../handler-types";

/* TODO transfer property ownership on HQ capture */

//Capture, APC supply, black bomb explosion, toggle stealth/sub hide.
export const abilityActionToEvent: SubActionToEvent<AbilityAction> = (
  match,
  action,
  fromPosition
) => {
  const player = match.getCurrentTurnPlayer();
  const unit = match.getUnitOrThrow(fromPosition);

  if (unit.data.playerSlot !== player.data.slot) {
    throw new DispatchableError("You don't own this unit");
  }

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

      if (unit.data.stats === "hidden") {
        break;
      }

      if (unit.data.currentCapturePoints === undefined) {
        unit.data.currentCapturePoints = 20;
      }

      if (unit.player.data.coId.name === "sami") {
        if (unit.player.data.COPowerState === "super-co-power") {
          unit.data.currentCapturePoints = 0; // insta capture
        } else {
          // capture at 1.5x rate, rounded down
          unit.data.currentCapturePoints -= Math.floor(unit.getHP() * 1.5);
        }
      } else {
        unit.data.currentCapturePoints -= unit.getHP();
      }

      if (unit.data.currentCapturePoints <= 0) {
        // finished capturing
        unit.data.currentCapturePoints = undefined;

        const tile = unit.getTile();

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
        match.getUnit(addDirection(unit.data.position, dir))?.resupply();
      }

      break;
    }
    case "blackBomb": {
      match.damageUntil1HPInRadius({
        radius: 3,
        visualHpAmount: 5,
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
