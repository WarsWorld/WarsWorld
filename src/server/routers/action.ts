import { observable } from "@trpc/server/observable";
import { Action, mainActionSchema } from "server/schemas/action";
import { isSamePosition } from "server/schemas/position";
import { emitEvent, subscribeToEvents } from "server/emitter/event-emitter";
import { prisma } from "server/prisma/prisma-client";
import { unitPropertiesMap } from "shared/match-logic/buildable-unit";
import { EmittableEvent, WWEvent } from "shared/types/events";
import { z } from "zod";
import {
  matchBaseProcedure,
  publicBaseProcedure,
  router,
} from "../trpc/trpc-setup";
import {
  BackendMatchState,
  PlayerInMatch,
} from "shared/types/server-match-state";
import { moveActionToEvent } from "server/match-logic/action-to-event/move";
import { buildActionToEvent } from "../match-logic/action-to-event/build";
import { Position } from "server/schemas/position";
import { getDiscoveredUnits } from "../match-logic/action-to-event/get-discovered-units";
import {
  unloadNoWaitActionToEvent,
  unloadWaitActionToEvent,
} from "../match-logic/action-to-event/unload";
import { addDirection } from "../../shared/match-logic/positions";
import { attackActionToEvent } from "../match-logic/action-to-event/attack";
import { abilityActionToEvent } from "../match-logic/action-to-event/ability";
import { repairActionToEvent } from "../match-logic/action-to-event/repair";
import { launchMissileActionToEvent } from "../match-logic/action-to-event/launchMissile";
import { TRPCError } from "@trpc/server";
import { applyMainEventToMatch, applySubEventToMatch } from "../match-logic/apply-event-to-match";

interface MainActionHandlerProps<T extends Action> {
  currentPlayer: PlayerInMatch;
  action: T;
  matchState: BackendMatchState;
}

interface SubActionHandlerProps<T extends Action> {
  currentPlayer: PlayerInMatch;
  action: T;
  matchState: BackendMatchState;
  fromPosition: Position;
}

export type MainActionToEvent<T extends Action> = (
  props: MainActionHandlerProps<T>
) => WWEvent;

export type SubActionToEvent<T extends Action> = (
  props: SubActionHandlerProps<T>
) => WWEvent;

// 1. validate shape (zod, .input())
// 2. validate action
// 3. create event from action

//TODO: COP, SCOP, pass turn events
const validateMainActionAndToEvent = (
  action: Action,
  actingPlayerInMatch: PlayerInMatch,
  match: BackendMatchState
): { event: WWEvent | undefined; position: Position | null } => {
  switch (action.type) {
    case "build": {
      return {
        event: buildActionToEvent({
          currentPlayer: actingPlayerInMatch,
          action,
          matchState: match,
        }),
        position: action.position,
      };
    }
    case "unload2": {
      //unload no wait
      return {
        event: unloadNoWaitActionToEvent({
          currentPlayer: actingPlayerInMatch,
          action,
          matchState: match,
        }),
        position: addDirection(
          action.transportPosition,
          action.unloads.direction
        ),
      };
    }
    case "move": {
      return {
        event: moveActionToEvent({
          currentPlayer: actingPlayerInMatch,
          action,
          matchState: match,
        }),
        position: action.path[action.path.length - 1],
      };
    }
  }

  return { event: undefined, position: null };
};

//TODO: remember that when unit joins, it counts as a "wait" subaction. overrite it!
//TODO: unload1 should "update" units discovered for up to 2 positions
const validateSubActionAndToEvent = (
  action: Action,
  actingPlayerInMatch: PlayerInMatch,
  match: BackendMatchState,
  unitPosition: Position
): WWEvent => {
  switch (action.type) {
    case "attack":
      return attackActionToEvent({
        currentPlayer: actingPlayerInMatch,
        action,
        matchState: match,
        fromPosition: unitPosition,
      });
    case "ability":
      return abilityActionToEvent({
        currentPlayer: actingPlayerInMatch,
        action,
        matchState: match,
        fromPosition: unitPosition,
      });
    case "unload1":
      return unloadWaitActionToEvent({
        currentPlayer: actingPlayerInMatch,
        action,
        matchState: match,
        fromPosition: unitPosition,
      });
    case "repair":
      return repairActionToEvent({
        currentPlayer: actingPlayerInMatch,
        action,
        matchState: match,
        fromPosition: unitPosition,
      });
    case "launchMissile":
      return launchMissileActionToEvent({
        currentPlayer: actingPlayerInMatch,
        action,
        matchState: match,
        fromPosition: unitPosition,
      });
    default:
      return { type: "wait" };
  }
};

export const actionRouter = router({
  send: matchBaseProcedure
    .input(mainActionSchema)
    .mutation(async ({ input, ctx }) => {
      const currentPlayer = ctx.match.players.find(
        (p) => p.playerId === ctx.currentPlayer.id && p?.eliminated !== true
      );

      //TODO is it trpc error or plain error?
      if (currentPlayer === undefined)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You're not in this match or you've been eliminated",
        });

      //TODO re-add this check, was unadded to test tRPC momentarily
      /*if (!currentPlayer.hasCurrentTurn) {
        throw new Error("It's not your turn");
      }*/

      const { event, position } = validateMainActionAndToEvent(
        input,
        currentPlayer,
        ctx.match
      );

      if (event === undefined) {
        throw new Error("Event has not been created");
      }

      applyMainEventToMatch(input.matchId, currentPlayer.slot, event);

      if (input.type === "move" && event.type === "move") {
        if (!event.trap)
          event.subEvent = validateSubActionAndToEvent(
            input.subAction,
            currentPlayer,
            ctx.match,
            event.path[event.path.length - 1]
          );

        if (position === null) throw new Error("This should never happen");
        applySubEventToMatch(
          input.matchId,
          currentPlayer.slot,
          event.subEvent,
          position
        );
      }

      await prisma.event.create({
        data: {
          matchId: input.matchId,
          content: event,
        },
      });

      const emittableEvent: EmittableEvent = {
        ...event,
        matchId: input.matchId,
      };
      if (position !== null) {
        emittableEvent.discoveredUnits = getDiscoveredUnits(
          ctx.match,
          position
        );
      }

      emitEvent(emittableEvent);

      return {
        status: "ok", // TODO not necessary?
      };
    }),
  onEvent: publicBaseProcedure.input(z.string()).subscription(({ input }) =>
    observable<EmittableEvent>((emit) => {
      const unsubscribe = subscribeToEvents(input, emit.next);
      return () => unsubscribe();
    })
  ),
});
