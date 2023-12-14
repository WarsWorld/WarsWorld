import { observable } from "@trpc/server/observable";
import { emit, subscribe } from "server/emitter/event-emitter";
import { prisma } from "server/prisma/prisma-client";
import {
  validateMainActionAndToEvent,
  validateSubActionAndToEvent
} from "shared/match-logic/events/action-to-event";
import { applyMainEventToMatch, applySubEventToMatch } from "shared/match-logic/events/apply-event-to-match";
import { mainActionSchema } from "shared/schemas/action";
import { getFinalPositionSafe } from "shared/schemas/position";
import type { Emittable, EmittableEvent } from "shared/types/events";
import {
  matchBaseProcedure,
  playerInMatchBaseProcedure,
  router
} from "../trpc/trpc-setup";
import { mainEventToEmittables } from "../../shared/match-logic/events/event-to-emittable";
import { fillDiscoveredUnitsAndProperties } from "../../shared/match-logic/events/vision-update";
import { updateMoveVision } from "../../shared/match-logic/events/handlers/move";

export const actionRouter = router({
  send: playerInMatchBaseProcedure
    .input(mainActionSchema)
    .mutation(async ({ input, ctx: { match, player } }) => {
      /**
       * EXTREMELY IMPORTANT! This order MUST be followed, otherwise some things may not have required information:
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

      /* 1. Move action to event */
      const mainEvent = validateMainActionAndToEvent(match, input);

      /* 2. Apply move event to match */
      applyMainEventToMatch(match, mainEvent);

      /**
       * TODO important!
       * we must try-catch the subEvent generation and applying
       * and then apply the "wait" subEvent as a fallback.
       * otherwise bugs or invalid moves would cause a desync
       * between server match state and database/client state
       * because we stop about here and don't store/emit.
       */

      let emittableEvents: (EmittableEvent | undefined)[]; // undefined means that team doesn't receive the event

      if (mainEvent.type === "move" && input.type === "move") {
        // second condition is only needed for type-gating input event

        /* 3. Sub action to event */
        // if there was a trap or join/load, the default subEvent is "wait".
        const isJoinOrLoad = match.getUnit(
          getFinalPositionSafe(mainEvent.path)
        ) !== undefined;

        if (!mainEvent.trap && !isJoinOrLoad) {
          mainEvent.subEvent = validateSubActionAndToEvent(
            match,
            input
          );
        }

        /* 4. Sub event to emittable sub events (done inside, first)*/
        /* 5. Move event to emittable move events */
        emittableEvents = mainEventToEmittables(match, mainEvent);

        /* 6. Update move event vision */
        updateMoveVision(match, mainEvent);

        /* 7. Apply sub event to match and update sub event vision */
        applySubEventToMatch(match, mainEvent);
      }
      else {
        emittableEvents = mainEventToEmittables(match, mainEvent);
      }

      /* 8. Update move vision (and add new vision in general to emittable events) */
      fillDiscoveredUnitsAndProperties(match, emittableEvents);

      /* 9. Emit emittable events */
      // TODO @function either this function gets a list of emittables, or we iterate through them here.
      //  undefined means that team shouldn't receive the event
      //  emittableEvents[i] is from match.teams[i]. emittableEvents has one extra "no team"(spectator) at the end
      emit(emittableEvents);

      /* 10. Save event */
      const eventOnDB = await prisma.event.create({
        data: {
          matchId: input.matchId,
          content: mainEvent
        }
      });

      // TODO we still need something like the following to handle timeout eliminations.

      // if (playerEliminatedEvent !== null) {
      //   applyMainEventToMatch(match, playerEliminatedEvent);

      //   const eliminationEventOnDB = await prisma.event.create({
      //     data: {
      //       content: playerEliminatedEvent,
      //       matchId: match.id
      //     }
      //   })

      //   const emittableEliminationEvent: EmittableEvent = {
      //     ...playerEliminatedEvent,
      //     matchId: match.id,
      //     index: eliminationEventOnDB.index
      //   }

      //   emit(emittableEliminationEvent)
      // }
    }),
  onEvent: matchBaseProcedure.subscription(({ input, ctx: { currentPlayer, match } }) =>
    {
      const player = match.getPlayerById(currentPlayer.id);
      
      

      return observable<Emittable>((emit) => {
        const unsubscribe = subscribe(input.matchId, emittable => {
          emit.next(emittable);
        });
        return () => unsubscribe();
      });
    }
  )
  // TODO create procedure for anonymous users to observe games
  // (they get their own special "-1" team or something)
});
