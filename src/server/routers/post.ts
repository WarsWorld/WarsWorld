import { z } from "zod";
import {
  playerBaseProcedure,
  publicBaseProcedure,
  router,
} from "../trpc/trpc-setup";
import { TRPCError } from "@trpc/server";
import { prisma } from "server/prisma/prisma-client";

const bannedWords = ["heck", "frick", "oof", "swag", "amongus"];

export const postRouter = router({
  all: publicBaseProcedure.query(() =>
    prisma.post.findMany({
      include: {
        author: true,
      },
    })
  ),
  add: playerBaseProcedure
    .input(
      z.object({
        id: z.string().uuid().optional(),
        text: z.string().min(1).max(5000),
        title: z.string().min(1).max(100),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const lines = input.text.split("\n");
      const words = lines.map((l) => l.split(" ")).flat();

      if (
        words.find((w) => bannedWords.includes(w.toLowerCase())) !== undefined
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "The post you were trying to created contains banned words",
        });
      }

      const containsBannedCharacters = /[^\w\.!\?\-\_\n ]/.test(input.text);

      if (containsBannedCharacters) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "The post you were trying to created contains banned characters",
        });
      }

      return prisma.post.create({
        data: {
          text: input.text.trimEnd(),
          title: input.title.trim(),
          authorId: ctx.currentPlayer.id,
        },
      });
    }),
  delete: playerBaseProcedure
    .input(z.object({
      postToDeleteId: z.string()
    }))
    .mutation(async ({ input, ctx }) => {
      const post = await prisma.post.findUniqueOrThrow({
        where: {
          id: input.postToDeleteId
        }
      })

      if (post.authorId !== ctx.currentPlayer.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You can't delete this post because it doesn't belong to your player"
        })
      }

      await prisma.post.delete({
        where: {
          id: input.postToDeleteId
        }
      })
    })
});
