import { emit } from "server/emitter/event-emitter";
import { prisma } from "server/prisma/prisma-client";
import {
  validateMainActionAndToEvent,
  validateSubActionAndToEvent,
} from "shared/match-logic/events/action-to-event";
import {
  applyMainEventToMatch,
  applySubEventToMatch,
} from "shared/match-logic/events/apply-event-to-match";
import { mainEventToEmittables } from "shared/match-logic/events/event-to-emittable";
import { updateMoveVision } from "shared/match-logic/events/handlers/move";
import { fillDiscoveredUnitsAndProperties } from "shared/match-logic/events/vision-update";
import type { MainAction } from "shared/schemas/action";
import { getFinalPositionSafe } from "shared/schemas/position";
import type {
  EmittableEvent,
  MainEventsWithoutSubEvents,
  MainEventWithSubEvents,
  SubEvent,
} from "shared/types/events";
import type { MatchWrapper } from "shared/wrappers/match";
import type { PlayerInMatchWrapper } from "shared/wrappers/player-in-match";

const attachSubEvent = (
  mainEventWithoutSubEvent: MainEventsWithoutSubEvents,
  subEvent: SubEvent,
): MainEventWithSubEvents => {
  if (mainEventWithoutSubEvent.type === "move") {
    return {
      ...mainEventWithoutSubEvent,
      subEvent,
    };
  }

  return mainEventWithoutSubEvent;
};

export const performAction = async (
  match: MatchWrapper,
  action: MainAction,
  _skipAuth = false,
): Promise<void> => {
  /**
   * EXTREMELY IMPORTANT! This order MUST be followed:
   * 1. Move action to event
   * 2. Apply move event to match
   * 3. Sub action to event
   * 4. Sub event to emittable sub events
   * 5. Move event to emittable move events
   * 6. Update move event vision
   * 7. Apply sub event to match and update sub event vision
   * 8. Add new discovered info (vision) to emittable events
   * 9. Emit emittable events
   * 10. Save event
   */

  console.log("Performing action:", action);

  /* 1. Move action to event */
  const mainEventWithoutSubEvent = validateMainActionAndToEvent(match, action);

  const isJoinOrLoad =
    mainEventWithoutSubEvent.type === "move" &&
    match.getUnit(getFinalPositionSafe(mainEventWithoutSubEvent.path)) !== undefined &&
    getFinalPositionSafe(mainEventWithoutSubEvent.path) !== mainEventWithoutSubEvent.path[0];

  /* 2. Apply move event to match */
  applyMainEventToMatch(match, mainEventWithoutSubEvent);

  let emittableEvents: (EmittableEvent | undefined)[];
  let subEvent: SubEvent = { type: "wait" };

  if (mainEventWithoutSubEvent.type === "move" && action.type === "move") {
    /* 3. Sub action to event */
    const mainEventWithSubEvent: MainEventWithSubEvents = {
      ...mainEventWithoutSubEvent,
      subEvent: {
        type: "wait",
      },
    };

    if (!mainEventWithoutSubEvent.trap && !isJoinOrLoad) {
      mainEventWithSubEvent.subEvent = validateSubActionAndToEvent(match, action);
    }

    /* 4. Sub event to emittable sub events (done inside, first)*/
    /* 5. Move event to emittable move events */
    emittableEvents = mainEventToEmittables(match, mainEventWithSubEvent);

    /* 6. Update move event vision */
    updateMoveVision(match, mainEventWithSubEvent);

    /* 7. Apply sub event to match and update sub event vision */
    applySubEventToMatch(match, mainEventWithSubEvent);
    subEvent = mainEventWithSubEvent.subEvent;
  } else {
    emittableEvents = mainEventToEmittables(match, mainEventWithoutSubEvent);
  }

  /* 8. Update move vision (and add new vision in general to emittable events) */
  fillDiscoveredUnitsAndProperties(match, emittableEvents);

  /* 9. Emit emittable events */
  emittableEvents.forEach((emittableEvent: EmittableEvent | undefined) => {
    if (emittableEvent && emittableEvent.teamIndex >= 0) {
      match.teams[emittableEvent.teamIndex].players.forEach((player: PlayerInMatchWrapper) => {
        emit(player.data.id, { ...emittableEvent, matchId: match.id });
      });
    }
  });

  /* 10. Save event */
  await prisma.event.create({
    data: {
      matchId: match.id,
      content: attachSubEvent(mainEventWithoutSubEvent, subEvent),
    },
  });
};
