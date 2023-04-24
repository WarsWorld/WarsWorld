import { WWMap } from "components/schemas/map";
import { Match } from "server/map-parser";
import { startMatchState } from "server/match-logic/server-match-states";
import { z } from "zod";
import { prisma } from "../prisma";
import { publicProcedure, router } from "../trpc";

export const matchRouter = router({
  create: publicProcedure // TODO private
    .input(
      z.object({
        playerId: z.string(),
        selectedCO: z.string(),
        mapId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const map = await prisma.map.findFirstOrThrow({
        where: { id: input.mapId },
      });
      const firstPlayer = await prisma.player.findFirstOrThrow({
        where: { id: input.playerId },
      });

      const matchOnDB = await prisma.match.create({
        data: {
          status: "ready",
          mapId: input.mapId,
          leagueType: "standard",
          matchState: {},
        },
      });

      startMatchState(
        matchOnDB.id,
        {
          name: map.name,
          tiles: map.tiles as WWMap["tiles"],
        },
        firstPlayer,
      );
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
