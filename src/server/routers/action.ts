import { observable } from "@trpc/server/observable";
import { Action, actionSchema } from "components/schemas/action";
import { armySchema } from "components/schemas/army";
import { emitEvent, subscribeToEvents } from "server/emitter/event-emitter";
import { applyEventToMatch } from "server/match-logic/server-match-states";
import { prisma } from "server/prisma/prisma-client";
import { EmittableEvent } from "types/core-game/event";
import { z } from "zod";
import { publicProcedure, router } from "../trpc/trpc-setup";

const validateAction = (action: Action) => {
  switch (action.type) {
    case "attemptMove": {
      // isPlayerTurn
      // canMakeMove (doesn't have active unit)
    }
  }
};

export const actionRouter = router({
  send: publicProcedure
    .input(
      z.object({
        actions: z.array(actionSchema).nonempty().max(2),
        matchId: z.string(),
        army: armySchema, // TODO obviously temporary lol
      }),
    )
    .mutation(async ({ input }) => {
      await prisma.match.findFirstOrThrow({
        where: { id: input.matchId },
        select: {},
      });

      input.actions.forEach(validateAction);

      // important: validate all actions first before changing server state or persisting to DB

      const events = input.actions.map<EmittableEvent>((action) => {
        switch (action.type) {
          case "build": {
            return {
              type: "build",
              matchId: input.matchId,
              position: action.position,
              unitType: action.unitType,
            };
          }
          default: {
            throw new Error(`Unknown action type ${action.type}`);
          }
        }
      });

      await prisma.event.createMany({
        data: events.map((e) => ({
          matchId: input.matchId,
          content: e,
        })),
      });

      events.forEach((event) => applyEventToMatch(input.matchId, event));
      events.forEach((event) => emitEvent(event));

      return {
        status: "ok", // TODO not necessary?
      };
    }),
  onEvent: publicProcedure.input(z.string()).subscription(({ input }) =>
    observable<EmittableEvent>((emit) => {
      const unsubscribe = subscribeToEvents(input, emit.next);
      return () => unsubscribe();
    }),
  ),
});
