import { observable } from "@trpc/server/observable";
import { Action, actionSchema } from "components/schemas/action";
import { createEmitter } from "server/create-emitter";
import { prisma } from "server/prisma";
import { WWEvent } from "types/core-game/event";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import { armySchema } from "components/schemas/army";
import { applyEventToMatch } from "server/match-logic/server-match-states";

const validateAction = (action: Action) => {
  switch (action.type) {
    case "attemptMove": {
      // isPlayerTurn
      // canMakeMove (doesn't have active unit)
    }
  }
};

const wwEventEmitter = createEmitter<WWEvent>();

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

      const events = input.actions.map<WWEvent>((action) => {
        switch (action.type) {
          case "build": {
            return {
              type: "build",
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
      events.forEach(wwEventEmitter.emit);

      return {
        status: "ok", // TODO not necessary?
      };
    }),
  onEvent: publicProcedure.subscription(() =>
    observable<WWEvent>((emit) => {
      const unsubscribe = wwEventEmitter.subscribe(emit.next);
      return () => unsubscribe();
    }),
  ),
});
