import { DispatchableError } from "shared/DispatchedError";
import type { Action, MainAction } from "shared/schemas/action";
import type { Position } from "shared/schemas/position";
import type { MainEvent, SubEvent } from "shared/types/events";
import type { MatchWrapper } from "shared/wrappers/match";
import { abilityActionToEvent } from "./handlers/ability";
import { attackActionToEvent } from "./handlers/attack";
import { buildActionToEvent } from "./handlers/build/build";
import { coPowerActionToEvent } from "./handlers/coPower";
import { launchMissileActionToEvent } from "./handlers/launchMissile";
import { moveActionToEvent } from "./handlers/move";
import { repairActionToEvent } from "./handlers/repair";
import { unloadNoWaitActionToEvent } from "./handlers/unloadNoWait";
import { unloadWaitActionToEvent } from "./handlers/unloadWait";

export const validateMainActionAndToEvent = (
  match: MatchWrapper,
  action: MainAction
): MainEvent => {
  switch (action.type) {
    case "build":
      return buildActionToEvent(match, action);
    case "unloadNoWait":
      return unloadNoWaitActionToEvent(match, action);
    case "move":
      return moveActionToEvent(match, action);
    case "coPower":
      return coPowerActionToEvent(match, action);
    case "passTurn":
      return { type: "passTurn", newWeather: "clear" /* TODO  weather */ };
    default:
      /** this would only run for bad data from DB because of zod when validating user data */
      throw new DispatchableError(
        `Can't handle action type ${(action as MainAction).type}`
      );
  }
};

export const validateSubActionAndToEvent = (
  match: MatchWrapper,
  action: Action,
  unitPosition: Position
): SubEvent => {
  switch (action.type) {
    case "attack":
      return attackActionToEvent(
        match,
        action,
        unitPosition,
        Math.random(),
        Math.random()
      );
    case "ability":
      return abilityActionToEvent(match, action, unitPosition);
    case "unloadWait":
      return unloadWaitActionToEvent(match, action, unitPosition);
    case "repair":
      return repairActionToEvent(match, action, unitPosition);
    case "launchMissile":
      return launchMissileActionToEvent(match, action, unitPosition);
    case "wait":
      return { type: "wait" };
    default:
      /** TODO: the second line will only be valid once we've implemented all subAction types!
       * this would only run for bad data from DB because of zod when validating user data */
      throw new DispatchableError(`Unsupported action type: ${action.type}`);
  }
};
