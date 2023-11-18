import { observable } from "@trpc/server/observable";
import { emitEvent, subscribeToEvents } from "server/emitter/event-emitter";
import { prisma } from "server/prisma/prisma-client";
import { DispatchableError } from "shared/DispatchedError";
import { abilityActionToEvent } from "shared/match-logic/action-to-event/ability";
import { attackActionToEvent } from "shared/match-logic/action-to-event/attack";
import { buildActionToEvent } from "shared/match-logic/action-to-event/build";
import { coPowerActionToEvent } from "shared/match-logic/action-to-event/co-power";
import { launchMissileActionToEvent } from "shared/match-logic/action-to-event/launchMissile";
import { moveActionToEvent } from "shared/match-logic/action-to-event/move";
import { passTurnActionToEvent } from "shared/match-logic/action-to-event/pass-turn";
import { repairActionToEvent } from "shared/match-logic/action-to-event/repair";
import {
  unloadNoWaitActionToEvent,
  unloadWaitActionToEvent,
} from "shared/match-logic/action-to-event/unload";
import { applySubEventToMatch } from "shared/match-logic/apply-event-to-match";
import type { Action } from "shared/schemas/action";
import { mainActionSchema } from "shared/schemas/action";
import type { Position } from "shared/schemas/position";
import type { EmittableEvent, WWEvent } from "shared/types/events";
import type { MatchWrapper } from "shared/wrappers/match";
import { z } from "zod";
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
): WWEvent => {
  switch (action.type) {
    case "build":
      return buildActionToEvent(match, action);
    case "unload2":
      //unload no wait
      return unloadNoWaitActionToEvent(match, action);
    case "move":
      return moveActionToEvent(match, action);
    case "coPower":
    case "superCOPower":
      return coPowerActionToEvent(match, action);
    case "passTurn":
      return passTurnActionToEvent(match, action);
    default: {
      throw new DispatchableError(`Can't handle action type ${action.type}`);
    }
  }
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
    case "wait":
      return { type: "wait" }; /* TODO which unit..? */
    default:
      throw new DispatchableError(`Unsupported action type: ${action.type}`);
  }
};

export const actionRouter = router({
  send: playerInMatchBaseProcedure
    .input(mainActionSchema)
    .mutation(async ({ input, ctx: { match } }) => {
      const event = validateMainActionAndToEvent(match, input);

      if (event === undefined) {
        throw new Error("Event has not been created");
      }

      match.applyEvent(event);

      if (event.type === "move") {
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

        const lastPosition = event.path.at(-1);

        if (lastPosition === undefined) {
          throw new Error("This should never happen");
        }

        applySubEventToMatch(match, event.subEvent, lastPosition);
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

      emittableEvent.discoveredUnits = match.players
        .getCurrentTurnPlayer()
        .getEnemyUnitsInVision()
        .map((u) => u.data);
      /* TODO hide stats from hidden or sonya units */
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
