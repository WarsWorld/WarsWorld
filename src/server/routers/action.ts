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

export const actionRouter = router({
  send: playerInMatchBaseProcedure
    .input(mainActionSchema)
    .mutation(async ({ input, ctx: { match, player } }) => {
      const mainEvent = validateMainActionAndToEvent(match, input);

      // IMPORTANT @FUNCTION IDIOT: we MUST apply the main event before validateSubActionAndToEvent
      // because the subAction needs the match state to be changed already, otherwise it's going to break.
      applyMainEventToMatch(match, mainEvent);

      /**
       * TODO important!
       * we must try-catch the subEvent generation and applying
       * and then apply the "wait" subEvent as a fallback.
       * otherwise bugs or invalid moves would cause a desync
       * between server match state and database/client state
       * because we stop about here and don't store/emit.
       */

      if (mainEvent.type === "move" && input.type === "move") {
        // second condition is only needed for type-gating input event

        const isJoinOrLoad = match.getUnit(
          getFinalPositionSafe(mainEvent.path)
        ) !== undefined;

        if (!mainEvent.trap && !isJoinOrLoad) {
          mainEvent.subEvent = validateSubActionAndToEvent(
            match,
            input.subAction,
            mainEvent.path[mainEvent.path.length - 1]
          );
        }

        // if there was a trap or join/load, the default subEvent
        // which must be "wait" gets applied here, otherwise the custom one.
        applySubEventToMatch(match, mainEvent);
      }

      const eventOnDB = await prisma.event.create({
        data: {
          matchId: input.matchId,
          content: mainEvent
        }
      });

      const emittableEvent: EmittableEvent = {
        ...mainEvent,
        matchId: input.matchId,
        index: eventOnDB.index
      };
      
      emittableEvent.discoveredUnits = player.team.getEnemyUnitsInVision()

      /**
       * TODO
       * right now we're emitting everything without checking if the receiver (observer)
       * can see the event (fog of war). once we do, we need to check the event
       * for any player elimination info and then send that part to all observers regardless
       * of vision. (also affects e.g. last unit was a hidden sub/stealth and crashed)
       */
      emit(emittableEvent);

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
