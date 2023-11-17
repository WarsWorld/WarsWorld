import { preferencesSchema } from "server/schemas/preferences";
import { prisma } from "server/prisma/prisma-client";
import { authMiddleware } from "server/trpc/middleware/auth";
import { playerWithoutCurrentMiddleware } from "server/trpc/middleware/player";
import {
  playerBaseProcedure,
  publicBaseProcedure,
  router,
} from "server/trpc/trpc-setup";
import { z } from "zod";
import { signUpSchema } from "server/schemas/auth";
import { TRPCError } from "@trpc/server";
import { hashPassword } from "server/hashPassword";

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
      })
  ),
  findFirstUserByName: publicBaseProcedure
    .input(z.object({ username: z.string() }))
    .query(
      async ({ input }) =>
        await prisma.user.findFirst({
          where: { name: input.username },
        })
    ),
  registerUser: publicBaseProcedure
    .input(signUpSchema)
    .mutation(async ({ input }) => {
      // Validation
      const isUserInDB = await prisma.user.count({
        where: { email: input.email },
      });

      if (isUserInDB && isUserInDB > 0)
        throw new TRPCError({
          code: "CONFLICT",
          message: "There is already a user with that email in the database",
        });

      // TODO: Password validation

      const hashedPassword = await hashPassword(input.password);

      // Write user to the database
      const user = await prisma.user.create({
        data: {
          name: input.username,
          password: hashedPassword,
          email: input.email,
        },
      });

      await prisma.player.create({
        data: {
          name: input.username,
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      });
    }),
});
