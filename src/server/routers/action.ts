import { observable } from "@trpc/server/observable";
import { emitEvent, subscribeToEvents } from "server/emitter/event-emitter";
import { moveActionToEvent } from "server/match-logic/action-to-event/move";
import { prisma } from "server/prisma/prisma-client";
import type { Action } from "server/schemas/action";
import { mainActionSchema } from "server/schemas/action";
import type { Position } from "server/schemas/position";
import type { EmittableEvent, WWEvent } from "shared/types/events";
import type { MatchWrapper } from "shared/wrappers/match";
import { z } from "zod";
import { addDirection } from "../../shared/match-logic/positions";
import { abilityActionToEvent } from "../match-logic/action-to-event/ability";
import { attackActionToEvent } from "../match-logic/action-to-event/attack";
import { buildActionToEvent } from "../match-logic/action-to-event/build";
import { getDiscoveredUnits } from "../match-logic/action-to-event/get-discovered-units";
import { launchMissileActionToEvent } from "../match-logic/action-to-event/launchMissile";
import { repairActionToEvent } from "../match-logic/action-to-event/repair";
import {
  unloadNoWaitActionToEvent,
  unloadWaitActionToEvent,
} from "../match-logic/action-to-event/unload";
import {
  applyMainEventToMatch,
  applySubEventToMatch,
} from "../match-logic/apply-event-to-match";
import {
  playerInMatchBaseProcedure,
  publicBaseProcedure,
  router,
} from "../trpc/trpc-setup";

export type MainActionToEvent<T extends Action> = (
  match: MatchWrapper,
  action: T
) => WWEvent;

export type SubActionToEvent<T extends Action> = (
  match: MatchWrapper,
  action: T,
  fromPosition: Position
) => WWEvent;

// 1. validate shape (zod, .input())
// 2. validate action
// 3. create event from action

//TODO: COP, SCOP, pass turn events
const validateMainActionAndToEvent = (
  match: MatchWrapper,
  action: Action
): { event: WWEvent | undefined; position: Position | null } => {
  switch (action.type) {
    case "build": {
      return {
        event: buildActionToEvent(match, action),
        position: action.position,
      };
    }
    case "unload2": {
      //unload no wait
      return {
        event: unloadNoWaitActionToEvent(match, action),
        position: addDirection(
          action.transportPosition,
          action.unloads.direction
        ),
      };
    }
    case "move": {
      return {
        event: moveActionToEvent(match, action),
        position: action.path[action.path.length - 1],
      };
    }
    case "coPower": {
      //TODO function :)
    }
    case "superCOPower": {
    }
    case "passTurn": {
    }
  }

  return { event: undefined, position: null };
};

//TODO: unload1 should "update" units discovered for up to 2 positions
const validateSubActionAndToEvent = (
  match: MatchWrapper,
  action: Action,
  unitPosition: Position
): WWEvent => {
  switch (action.type) {
    case "attack":
      return attackActionToEvent(match, action, unitPosition);
    case "ability":
      return abilityActionToEvent(match, action, unitPosition);
    case "unload1":
      return unloadWaitActionToEvent(match, action, unitPosition);
    case "repair":
      return repairActionToEvent(match, action, unitPosition);
    case "launchMissile":
      return launchMissileActionToEvent(match, action, unitPosition);
    default:
      return { type: "wait" };
  }
};

export const actionRouter = router({
  send: playerInMatchBaseProcedure
    .input(mainActionSchema)
    .mutation(async ({ input, ctx: { match } }) => {
      //TODO re-add this check, was unadded to test tRPC momentarily
      /*if (!currentPlayer.hasCurrentTurn) {
        throw new Error("It's not your turn");
      }*/

      const { event, position } = validateMainActionAndToEvent(match, input);

      if (event === undefined) {
        throw new Error("Event has not been created");
      }

      applyMainEventToMatch(match, event);

      if (input.type === "move" && event.type === "move") {
        if (!event.trap) {
          //check if unit joined/loaded (cause then sub-action = wait)
          if (!match.units.hasUnit(event.path[event.path.length - 1])) {
            event.subEvent = validateSubActionAndToEvent(
              match,
              input.subAction,
              event.path[event.path.length - 1]
            );
          }
        }

        if (position === null) {
          throw new Error("This should never happen");
        }

        applySubEventToMatch(input.matchId, event.subEvent, position);
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
        emittableEvent.discoveredUnits = getDiscoveredUnits(match, position);
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
