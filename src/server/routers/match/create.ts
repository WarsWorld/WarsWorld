import { matchStore } from "server/match-store";
import { prisma } from "server/prisma/prisma-client";
import { mapMiddleware } from "server/trpc/middleware/map";
import { playerBaseProcedure } from "server/trpc/trpc-setup";
import { matchRulesSchema } from "shared/schemas/match-rules";
import { z } from "zod";
import { matchToFrontend } from "./util";

export const createMatchProcedure = playerBaseProcedure
  .input(
    z.object({
      rules: matchRulesSchema,
      mapId: z.string(),
    }),
  )
  .use(mapMiddleware)
  .mutation(async ({ input, ctx }) => {
    const matchOnDB = await prisma.match.create({
      data: {
        status: "setup",
        leagueType: "standard",
        playerState: [{
          slot: 0,
          hasCurrentTurn: true,
          id: ctx.currentPlayer.id,
          name: ctx.currentPlayer.name,
          ready: false,
          coId: {
            name: "andy",
            version: "AW2"
          },
          eliminated: false,
          //TODO: Handle funds correctly
          funds: 10000,
          powerMeter: 0,
          timesPowerUsed: 0,
          army: "orange-star",
          COPowerState: "no-power"
        },],
        map: {
          connect: {
            id: ctx.map.id,
          },
        },
        rules: input.rules,
      },
    });

    const match = matchStore.createMatchAndIndex(matchOnDB, ctx.map);
    return matchToFrontend(match);
  });
