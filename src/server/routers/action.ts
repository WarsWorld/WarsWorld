import { observable } from "@trpc/server/observable";
import { emit, subscribe } from "server/emitter/event-emitter";
import { prisma } from "server/prisma/prisma-client";
import {
  validateMainActionAndToEvent,
  validateSubActionAndToEvent
} from "shared/match-logic/events/action-to-event";
import { applySubEventToMatch } from "shared/match-logic/events/apply-event-to-match";
import { mainActionSchema } from "shared/schemas/action";
import type { Emittable, EmittableEvent } from "shared/types/events";
import { z } from "zod";
import {
  playerInMatchBaseProcedure,
  publicBaseProcedure,
  router
} from "../trpc/trpc-setup";
import { getFinalPositionSafe } from "shared/schemas/position";

export const actionRouter = router({
  send: playerInMatchBaseProcedure
    .input(mainActionSchema)
    .mutation(async ({ input, ctx: { match, playerInMatch } }) => {
      const event = validateMainActionAndToEvent(match, input);

      // IMPORTANT @FUNCTION IDIOT: we MUST apply the main event before validateSubActionAndToEvent
      // because the subAction needs the match state to be changed already, otherwise it's going to break.
      match.applyMainEvent(event);

      if (event.type === "move" && input.type === "move") {
        // second condition is only needed for type-gating input event

        const isJoinOrLoad = match.hasUnit(
          getFinalPositionSafe(event.path)
        );

        if (!event.trap && !isJoinOrLoad) {
          event.subEvent = validateSubActionAndToEvent(
            match,
            input.subAction,
            event.path[event.path.length - 1]
          );
        }

        // if there was a trap or join/load, the default subEvent
        // which must be "wait" gets applied here, otherwise the custom one.
        applySubEventToMatch(match, event);
      }

      const eventOnDB = await prisma.event.create({
        data: {
          matchId: input.matchId,
          content: event
        }
      });

      const emittableEvent: EmittableEvent = {
        ...event,
        matchId: input.matchId,
        eventIndex: eventOnDB.index
      };

      
      emittableEvent.discoveredUnits = playerInMatch.team.getEnemyUnitsInVision()

      emit(emittableEvent);
    }),
  onEvent: publicBaseProcedure.input(z.string()).subscription(({ input }) =>
    observable<Emittable>((emit) => {
      const unsubscribe = subscribe(input, emit.next);
      return () => unsubscribe();
    })
  )
});
