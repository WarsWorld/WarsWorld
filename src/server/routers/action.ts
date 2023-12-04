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
