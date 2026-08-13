import { DispatchableError } from "server/engine/DispatchedError";
import { getFinalPositionSafe } from "server/core/schemas/position";
import type { MatchWrapper } from "server/engine/entities/match";
import type { MainEventsWithoutSubEvents, MoveEventWithSubEvent } from "server/engine/types/events";
import { applyAbilityEvent } from "server/engine/events/handlers/ability";
import { applyAttackEvent } from "server/engine/events/handlers/attack/applyAttackEvent";
import { applyBuildEvent } from "server/engine/events/handlers/build";
import { applyCOPowerEvent } from "server/engine/events/handlers/coPower";
import { applyDeleteEvent } from "server/engine/events/handlers/delete";
import { applyLaunchMissileEvent } from "server/engine/events/handlers/launchMissile";
import { applyMatchStartEvent } from "server/engine/events/handlers/match-start";
import { applyMoveEvent } from "server/engine/events/handlers/move";
import { applyPassTurnEvent } from "server/engine/events/handlers/passTurn";
import { applyRepairEvent } from "server/engine/events/handlers/repair";
import { applyUnloadNoWaitEvent } from "server/engine/events/handlers/unload/unloadNoWait";
import { applyUnloadWaitEvent } from "server/engine/events/handlers/unload/unloadWait";

export const applyMainEventToMatch = (
  match: MatchWrapper,
  event: MainEventsWithoutSubEvents,
): void => {
  switch (event.type) {
    case "build": {
      applyBuildEvent(match, event);
      break;
    }
    case "delete": {
      applyDeleteEvent(match, event);
      break;
    }
    case "move": {
      applyMoveEvent(match, event);
      break;
    }
    case "unloadNoWait": {
      applyUnloadNoWaitEvent(match, event);
      break;
    }
    case "coPower": {
      applyCOPowerEvent(match, event);
      break;
    }
    case "passTurn": {
      applyPassTurnEvent(match, event);
      break;
    }
    case "matchStart": {
      applyMatchStartEvent(match, event);
      break;
    }
    default: {
      throw new DispatchableError(`Can't apply main event type ${event.type}`);
    }
  }
};

export const applySubEventToMatch = (
  match: MatchWrapper,
  { subEvent, path }: MoveEventWithSubEvent,
) => {
  const fromPosition = getFinalPositionSafe(path);

  switch (subEvent.type) {
    case "wait": {
      break;
    }
    case "attack": {
      applyAttackEvent(match, subEvent, fromPosition);
      break;
    }
    case "ability": {
      applyAbilityEvent(match, subEvent, fromPosition);
      break;
    }
    case "unloadWait": {
      applyUnloadWaitEvent(match, subEvent, fromPosition);
      break;
    }
    case "repair": {
      applyRepairEvent(match, subEvent, fromPosition);
      break;
    }
    case "launchMissile": {
      applyLaunchMissileEvent(match, subEvent, fromPosition);
      break;
    }
  }
};
