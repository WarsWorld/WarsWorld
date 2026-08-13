import { DispatchableError } from "server/engine/DispatchedError";
import type { MainAction, MoveAction } from "server/core/schemas/action";
import { getFinalPositionSafe } from "server/core/schemas/position";
import type { MainEventsWithoutSubEvents, SubEvent } from "server/engine/types/events";
import type { MatchWrapper } from "server/engine/entities/match";
import { abilityActionToEvent } from "server/engine/events/handlers/ability";
import { attackActionToEvent } from "server/engine/events/handlers/attack/attackActionToEvent";
import { buildActionToEvent } from "server/engine/events/handlers/build";
import { coPowerActionToEvent } from "server/engine/events/handlers/coPower";
import { deleteActionToEvent } from "server/engine/events/handlers/delete";
import { launchMissileActionToEvent } from "server/engine/events/handlers/launchMissile";
import { moveActionToEvent } from "server/engine/events/handlers/move";
import { passTurnActionToEvent } from "server/engine/events/handlers/passTurn";
import { repairActionToEvent } from "server/engine/events/handlers/repair";
import { unloadNoWaitActionToEvent } from "server/engine/events/handlers/unload/unloadNoWait";
import { unloadWaitActionToEvent } from "server/engine/events/handlers/unload/unloadWait";

export const validateMainActionAndToEvent = (
  match: MatchWrapper,
  action: MainAction,
): MainEventsWithoutSubEvents => {
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
