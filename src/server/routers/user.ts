import { preferencesSchema } from "components/schemas/preferences";
import { prisma } from "server/prisma/prisma-client";
import { authMiddleware } from "server/trpc/middleware/auth";
import { playerWithoutCurrentMiddleware } from "server/trpc/middleware/player";
import {
  playerBaseProcedure,
  publicBaseProcedure,
  router,
} from "server/trpc/trpc-setup";

export const userRouter = router({
  me: publicBaseProcedure
    .use(authMiddleware)
    .use(playerWithoutCurrentMiddleware)
    .query(({ ctx }) => ctx), // TODO session exposed in FE dangerous? 😳
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
});
