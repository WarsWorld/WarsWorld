import { preferencesSchema } from "components/schemas/preferences";
import { prisma } from "server/prisma/prisma-client";
import { playerProcedure, router } from "server/trpc/trpc-setup";

export const userRouter = router({
  me: playerProcedure.query(({ ctx }) => ctx),
  updatePreferences: playerProcedure.input(preferencesSchema).mutation(async ({ input, ctx }) => {
    const x = input.favouriteGames

    await prisma.player.update({
      data: {
        preferences: {
          favouriteGames: x
        }
      },
      where: {
        id: ctx.currentPlayer.id
      }
    })
  })
});
