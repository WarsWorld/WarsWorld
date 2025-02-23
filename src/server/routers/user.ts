import { prisma } from "server/prisma/prisma-client";
import { authMiddleware } from "server/trpc/middleware/auth";
import { playerWithoutCurrentMiddleware } from "server/trpc/middleware/player";
import { playerBaseProcedure, publicBaseProcedure, router } from "server/trpc/trpc-setup";
import { preferencesSchema } from "shared/schemas/preferences";
import { z } from "zod";

export const userRouter = router({
  me: publicBaseProcedure
    .use(authMiddleware)
    .use(playerWithoutCurrentMiddleware)
    .query(({ ctx }) => {
      return {
        user: ctx.user,
        ownedPlayers: ctx.ownedPlayers,
      };
    }), // TODO session exposed in FE dangerous? 😳
  updatePreferences: playerBaseProcedure.input(preferencesSchema).mutation(
    async ({ input, ctx }) =>
      await prisma.player.update({
        data: {
          preferences: input,
        },
        where: {
          id: ctx.currentPlayer.id,
        },
      }),
  ),
  findFirstUserByName: publicBaseProcedure.input(z.object({ username: z.string() })).query(
    async ({ input }) =>
      await prisma.user.findFirst({
        where: { name: input.username },
      }),
  ),
});
