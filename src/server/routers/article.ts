import { z } from "zod";
import {
  playerBaseProcedure,
  publicBaseProcedure,
  router,
} from "../trpc/trpc-setup";
import { TRPCError } from "@trpc/server";
import { prisma } from "server/prisma/prisma-client";
import { type ArticleCategories, type ArticleType, articleTypeSchema } from "shared/schemas/article";
import matter from "gray-matter";

const bannedWords = ["heck", "frick", "oof", "swag", "amongus"];
const NEWS_CATEGORIES: ArticleCategories[] = ["patch", "events", "news", "maintenance"];
const GUIDE_CATEGORIES: ArticleCategories[] = ["basics", "advance", "site"];

export const articleRouter = router({
  getMetadataByType: publicBaseProcedure
    .input(
      z.object({
        type: articleTypeSchema
      })
    )
    .query(({ input }) => {
      const categories = 
        input.type == "news" ? NEWS_CATEGORIES : GUIDE_CATEGORIES;

      return prisma.article.findMany({
        select: {
          id: true,
          title: true,
          description: true,
          thumbnail: true,
          category: true,
          createdAt: true,
        },
        where: {
          category: {
            in: categories,
          },
        },
      })
    }   
  ),
  getMarkdownById: publicBaseProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input }) => {
      const article = await prisma.article.findFirst({
        select: {
          body: true,
          title: true,
          description: true,
          thumbnail: true,
          category: true,
          createdAt: true,
        },
        where: {
          AND: {
            id: parseInt(input.id),
          }
        }
      });

      if(article == null) {
        return null;
      }

      const type: ArticleType = (NEWS_CATEGORIES.includes(article.category)) ? "news" : "guide";
      const content = matter(article.body).content;

      return {
        ...article,
        type: type,
        body: content,
      };
    }
  ),
  /*
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
    .input(
      z.object({
        postToDeleteId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const post = await prisma.post.findUniqueOrThrow({
        where: {
          id: input.postToDeleteId,
        },
      });

      if (post.authorId !== ctx.currentPlayer.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message:
            "You can't delete this post because it doesn't belong to your player",
        });
      }

      await prisma.post.delete({
        where: {
          id: input.postToDeleteId,
        },
      });
    }),
    */
});
