import { DispatchableError } from "shared/DispatchedError";
import type { Position } from "shared/schemas/position";
import type { MatchWrapper } from "shared/wrappers/match";
import type { MainEvent, SubEvent } from "../../types/events";
import { applyAbilityEvent } from "./handlers/ability";
import { applyAttackEvent } from "./handlers/attack";
import { applyBuildEvent } from "./handlers/build/build";
import { applyCOPowerEvent } from "./handlers/coPower";
import { applyLaunchMissileEvent } from "./handlers/launchMissile";
import { applyMoveEvent } from "./handlers/move";
import { applyPassTurnEvent } from "./handlers/passTurn";
import { applyRepairEvent } from "./handlers/repair";
import { applyUnloadNoWaitEvent } from "./handlers/unloadNoWait";
import { applyUnloadWaitEvent } from "./handlers/unloadWait";

//TODO: call subevents from move case? or different?
export const applyMainEventToMatch = (
  match: MatchWrapper,
  event: MainEvent
) => {
  switch (event.type) {
    case "build":
      return applyBuildEvent(match, event);
    case "move":
      return applyMoveEvent(match, event);
    case "unloadNoWait":
      return applyUnloadNoWaitEvent(match, event);
    case "coPower":
      return applyCOPowerEvent(match, event);
    case "passTurn":
      return applyPassTurnEvent(match, event);
    default: {
      throw new DispatchableError(`Can't apply main event type ${event.type}`);
    }
  }
};

export const applySubEventToMatch = (
  match: MatchWrapper,
  event: SubEvent,
  fromPosition: Position
) => {
  const unit = match.units.getUnitOrThrow(fromPosition);

  switch (event.type) {
    case "wait":
      break;
    case "attack": {
      applyAttackEvent(match, event, fromPosition);
      break;
    }
    case "ability": {
      applyAbilityEvent(match, unit);
      break;
    }
    case "unloadWait": {
      applyUnloadWaitEvent(match, event, fromPosition);
      break;
    }
    case "repair": {
      applyRepairEvent(match, event, fromPosition);
      break;
    }
    case "launchMissile": {
      applyLaunchMissileEvent(match, event);
      break;
    }
    default: {
      /**
       * TODO since the switch is exhaustive,
       * this could only possible run if there's incompatible data in a replay
       * where when we read from it, the data isn't validated by zod.
       * maybe remove?
       *
       * the exhaustiveness is the reason for `as SubEvent` because otherwise `event` is `never`.
       */
      throw new DispatchableError(
        `Can't apply sub event type ${(event as SubEvent).type}`
      );
    }
  }

  unit.data.isReady = false;
};
