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
import type { Emittable, EmittableEvent, PlayerEliminatedEvent } from "shared/types/events";
import { z } from "zod";
import {
  playerInMatchBaseProcedure,
  publicBaseProcedure,
  router
} from "../trpc/trpc-setup";
import { getPlayerEliminatedEventDueToCaptureOrAttack, getPlayerEliminatedEventDueToFuelDrain } from "shared/match-logic/events/handlers/playerEliminated";

export const actionRouter = router({
  send: playerInMatchBaseProcedure
    .input(mainActionSchema)
    .mutation(async ({ input, ctx: { match, player } }) => {
      const mainEvent = validateMainActionAndToEvent(match, input);

      /**
       * we need to analyze and check for player eliminations separate from the events.
       * that's because we need a separate event for eliminations because
       * eliminations are always public whereas some events are not (e.g. move during fog of war).
       * we need the generated event data (at least for capture and attack) so this
       * code comes after the validation.
       * we also need to read the match state before applying the event in order
       * to determine who gets the properties if a player gets eliminated by capture.
       * that's the reason these player elimination checks / events are
       * sandwiched between validation and application of the events like this.
       */
      let playerEliminatedEvent: PlayerEliminatedEvent | null = null;

      if (mainEvent.type === "passTurn") {
        playerEliminatedEvent = getPlayerEliminatedEventDueToFuelDrain(match);
      }

      // IMPORTANT @FUNCTION IDIOT: we MUST apply the main event before validateSubActionAndToEvent
      // because the subAction needs the match state to be changed already, otherwise it's going to break.
      applyMainEventToMatch(match, mainEvent);

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

        playerEliminatedEvent = getPlayerEliminatedEventDueToCaptureOrAttack(match, mainEvent)

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

      emit(emittableEvent);

      if (playerEliminatedEvent !== null) {
        applyMainEventToMatch(match, playerEliminatedEvent);

        const eliminationEventOnDB = await prisma.event.create({
          data: {
            content: playerEliminatedEvent,
            matchId: match.id
          }
        })

        const emittableEliminationEvent: EmittableEvent = {
          ...playerEliminatedEvent,
          matchId: match.id,
          index: eliminationEventOnDB.index
        }

        emit(emittableEliminationEvent)
      }
    }),
  onEvent: publicBaseProcedure.input(z.string()).subscription(({ input }) =>
    observable<Emittable>((emit) => {
      const unsubscribe = subscribe(input, emit.next);
      return () => unsubscribe();
    })
  )
});
