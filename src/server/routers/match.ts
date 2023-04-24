import { Match } from "server/map-parser";
import { z } from "zod";
import { prisma } from "../prisma";
import { publicProcedure, router } from "../trpc";

export const matchRouter = router({
  create: publicProcedure
    .input(
      z.object({
        playerName: z.string(),
        selectedCO: z.string(),
        mapId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return prisma.match.create({
        data: {
          status: "ready",
          mapId: input.mapId,
          leagueType: "standard",
          matchState: {},
        },
      });
    }),
  getAll: publicProcedure.query(() => prisma.match.findMany()),
  full: publicProcedure.input(z.string()).query(async ({ input }) => {
    const thing = await prisma.match.findFirst({
      where: {
        id: input,
      },
    });

    if (thing === null) {
      return null;
    }

    return {
      ...thing,
      matchState: thing?.matchState as Match,
    };
  }),
});
