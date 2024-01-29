import { DispatchableError } from "shared/DispatchedError";
import type { Action, MainAction, MoveAction } from "shared/schemas/action";
import type { Position } from "shared/schemas/position";
import type { MainEvent, SubEvent } from "shared/types/events";
import type { MatchWrapper } from "shared/wrappers/match";
import { abilityActionToEvent } from "./handlers/ability";
import { attackActionToEvent } from "./handlers/attack";
import { buildActionToEvent } from "./handlers/build";
import { coPowerActionToEvent } from "./handlers/coPower";
import { launchMissileActionToEvent } from "./handlers/launchMissile";
import { moveActionToEvent } from "./handlers/move";
import { repairActionToEvent } from "./handlers/repair";
import { unloadNoWaitActionToEvent } from "./handlers/unloadNoWait";
import { unloadWaitActionToEvent } from "./handlers/unloadWait";
import { passTurnActionToEvent } from "./handlers/passTurn";
import { getFinalPositionSafe } from "shared/schemas/position";
import { deleteActionToEvent } from "./handlers/delete";

export const validateMainActionAndToEvent = (
  match: MatchWrapper,
  action: MainAction,
): MainEvent => {
  switch (action.type) {
    case "build":
      return buildActionToEvent(match, action);
    case "delete":
      return deleteActionToEvent(match, action);
    case "unloadNoWait":
      return unloadNoWaitActionToEvent(match, action);
    case "move":
      return moveActionToEvent(match, action);
    case "coPower":
      return coPowerActionToEvent(match, action);
    case "passTurn":
      return passTurnActionToEvent(match, action);
    default:
      /** this would only run for bad data from DB because of zod when validating user data */
      throw new DispatchableError(`Can't handle action type ${(action as MainAction).type}`);
  }
};

export const validateSubActionAndToEvent = (
  match: MatchWrapper,
  { subAction, path }: MoveAction,
): SubEvent => {
  const unitPosition = getFinalPositionSafe(path);

  switch (subAction.type) {
    case "attack":
      return attackActionToEvent(
        match,
        subAction,
        unitPosition,
        path.length > 1,
        { goodLuck: Math.random(), badLuck: Math.random() },
        { goodLuck: Math.random(), badLuck: Math.random() },
      );
    case "ability":
      return abilityActionToEvent(match, subAction, unitPosition);
    case "unloadWait":
      return unloadWaitActionToEvent(match, subAction, unitPosition);
    case "repair":
      return repairActionToEvent(match, subAction, unitPosition);
    case "launchMissile":
      return launchMissileActionToEvent(match, subAction, unitPosition);
    case "wait":
      return { type: "wait" };
  }
};
