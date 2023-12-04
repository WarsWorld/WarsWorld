import { observable } from "@trpc/server/observable";
import { emit, subscribe } from "server/emitter/event-emitter";
import { prisma } from "server/prisma/prisma-client";
import {
  validateMainActionAndToEvent,
  validateSubActionAndToEvent
} from "shared/match-logic/events/action-to-event";
import { applyMainEventToMatch, applySubEventToMatch } from "shared/match-logic/events/apply-event-to-match";
import { mainActionSchema } from "shared/schemas/action";
import type { Emittable, EmittableEvent, PlayerEliminatedEvent } from "shared/types/events";
import { z } from "zod";
import {
  playerInMatchBaseProcedure,
  publicBaseProcedure,
  router
} from "../trpc/trpc-setup";
import { getFinalPositionSafe } from "shared/schemas/position";
import { eliminatePlayer } from "./match/util";

export const actionRouter = router({
  send: playerInMatchBaseProcedure
    .input(mainActionSchema)
    .mutation(async ({ input, ctx: { match, player } }) => {
      const event = validateMainActionAndToEvent(match, input);

      // IMPORTANT @FUNCTION IDIOT: we MUST apply the main event before validateSubActionAndToEvent
      // because the subAction needs the match state to be changed already, otherwise it's going to break.
      applyMainEventToMatch(match, event);

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
        index: eventOnDB.index
      };

      
      emittableEvent.discoveredUnits = player.team.getEnemyUnitsInVision()

      emit(emittableEvent);

      // TODO check for loss conditions? (below is WIP)

      if (event.type === "move") { // TODO if day limit reached, check for winner by captured properties
        if (event.subEvent.type === "ability") {
          // TODO check if HQ / number of labs was captured

          const unit = match.getUnitOrThrow(event.path[0]!);

          if (!unit.isInfantryOrMech()) {
            return; // not a capture
          }

          const tile = match.getTile(getFinalPositionSafe(event.path))

          if (!("playerSlot" in tile)) {
            throw new Error("This should never happen: When checking win conditions of capture, tile wasn't capturable")
          }

          const previousOwner = match.getBySlot(tile.playerSlot); // TODO this won't work because at this point, the playerSlot was already changed

          if (previousOwner === undefined) {
            return; // should only happen when capturing tiles owned by neutral (slot = -1)
          }

          const playerHasNoHQ = false; // TODO

          const playerLabs = match.changeableTiles.filter(tile => (
            tile.type === "lab"
            && tile.playerSlot === previousOwner.data.slot
          ))

          const playerHasNoLabsLeft = playerLabs.length === 0

          if (
            tile.type === "hq"
            || (playerHasNoHQ && tile.type === "lab" && playerHasNoLabsLeft)
          ) {
            const eliminationEvent: PlayerEliminatedEvent = {
              type: "player-eliminated",
              playerId: previousOwner.data.id,
              condition: "by HQ / lab capture",
            }

            const eliminationEventOnDB = await prisma.event.create({
              data: {
                content: eliminationEvent,
                matchId: match.id
              }
            })

            // TODO this match altering code should be an applyEvent thing that can be used by clients as well
            for (const changeableTile of match.changeableTiles) { // give current player all owned properties of eliminated player
              if ("playerSlot" in changeableTile && previousOwner.owns(changeableTile)) {
                changeableTile.playerSlot = player.data.slot
              }
            }

            eliminatePlayer(previousOwner)

            emit({
              ...eliminationEvent,
              matchId: match.id,
              index: eliminationEventOnDB.index
            })
          }
        }

        if (event.subEvent.type === "attack") {
          // TODO check if all units were destroyed, then eliminate player
        }
      }
    }),
  onEvent: publicBaseProcedure.input(z.string()).subscription(({ input }) =>
    observable<Emittable>((emit) => {
      const unsubscribe = subscribe(input, emit.next);
      return () => unsubscribe();
    })
  )
});
