import { observable } from "@trpc/server/observable";
import { emit, subscribe } from "server/emitter/event-emitter";
import { prisma } from "server/prisma/prisma-client";
import { validateMainActionAndToEvent } from "shared/match-logic/events/action-to-event";
import { applySubEventToMatch } from "shared/match-logic/events/apply-event-to-match";
import { mainActionSchema } from "shared/schemas/action";
import type { Emittable, EmittableEvent } from "shared/types/events";
import { z } from "zod";
import {
  playerInMatchBaseProcedure,
  publicBaseProcedure,
  router,
} from "../trpc/trpc-setup";

export const actionRouter = router({
  send: playerInMatchBaseProcedure
    .input(mainActionSchema)
    .mutation(async ({ input, ctx: { match } }) => {
      const event = validateMainActionAndToEvent(match, input);

      match.applyMainEvent(event);

      if (event.type === "move") {
        /* TODO not sure this special handling for trap is necessary */

        if (!event.trap) {
          //check if unit joined/loaded (cause then sub-action = wait)
          if (!match.units.hasUnit(event.path[event.path.length - 1])) {
            /** TODO i think because of the architecture, this logic must be moved inside of validateMainActionAndToEvent */
            // event.subEvent = validateSubActionAndToEvent(
            //   match,
            //   input.subAction,
            //   event.path[event.path.length - 1]
            // );
          }
        }

        /** TODO shouldn't this be the job of applyMoveEvent? */
        applySubEventToMatch(match, event);
      }

      const eventOnDB = await prisma.event.create({
        data: {
          matchId: input.matchId,
          content: event,
        },
      });

      const emittableEvent: EmittableEvent = {
        ...event,
        matchId: input.matchId,
        eventIndex: eventOnDB.index,
      };

      emittableEvent.discoveredUnits = match.players
        .getCurrentTurnPlayer()
        .getEnemyUnitsInVision();

      emit(emittableEvent);
    }),
  onEvent: publicBaseProcedure.input(z.string()).subscription(({ input }) =>
    observable<Emittable>((emit) => {
      const unsubscribe = subscribe(input, emit.next);
      return () => unsubscribe();
    })
  ),
});
