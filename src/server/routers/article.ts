import { z } from "zod";
import {
  playerBaseProcedure,
  publicBaseProcedure,
  router,
} from "../trpc/trpc-setup";
import { TRPCError } from "@trpc/server";
import { prisma } from "server/prisma/prisma-client";
import { type ArticleCategories, articleSchema, articleCommentSchema } from "shared/schemas/article";

const bannedWords = ["heck", "frick", "oof", "swag", "amongus"];

export const articleTypeSchema = z.enum([
  "news",
  "guide",
]);
export type ArticleType = z.infer<typeof articleTypeSchema>;

const TYPES: Record<ArticleType, ArticleCategories[]> = {
  "news": ["patch", "events", "news", "maintenance"],
  "guide": ["basics", "advance", "site"],
}

export const articleRouter = router({
  getMetadataByType: publicBaseProcedure
    .input(
      z.object({
        type: articleTypeSchema
      })
    )
    .query(({ input }) => {
      const categories = TYPES[input.type];

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
          Comments: {
            include: {
              player: true
            },
            orderBy: {
              createdAt: "desc"
            }
          },
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

      const type = (Object.keys(TYPES) as ArticleType[]).find(key => TYPES[key].includes(article.category));
      
      return {
        ...article,
        type: type,
      };
    }
  ),
  addComment: playerBaseProcedure
    .input(articleCommentSchema)
    .mutation(async ({ input, ctx }) => {
      const lines = input.comment.split("\n");
      const words = lines.map((l) => l.split(" ")).flat();

      if (
        words.find((w) => bannedWords.includes(w.toLowerCase())) !== undefined
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "The comment you were trying to create contains banned words",
        });
      }

      const containsBannedCharacters = /[^\w\.!\?\-\_\n ]/.test(input.comment);

      if (containsBannedCharacters) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "The comment you were trying to create contains banned characters",
        });
      }

      return prisma.articleComment.create({
        data: {
          body: input.comment.trimEnd(),
          playerId: ctx.currentPlayer.id,
          articleId: input.articleId
        },
      });
  }),
  create: playerBaseProcedure
    .input(articleSchema)
    .mutation(async ({ input, ctx }) => {
      const lines = input.body.split("\n");
      const words = lines.map((l) => l.split(" ")).flat();

      if (
        words.find((w) => bannedWords.includes(w.toLowerCase())) !== undefined
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "The post you were trying to create contains banned words",
        });
      }

      const newArticle = await prisma.article.create({
        data: {
          title: input.title,
          description: input.description,
          Authors: {
            create: [
              {
                author: {
                  connect: {
                    id: ctx.currentPlayer.id,
                  },
                },
              },
            ]
          },
          thumbnail: input.thumbnail,
          category: input.category,
          body: input.body,
        }
      });

      return {
        id: newArticle.id,
        title: newArticle.title,
      }
    }
 
  ),
  // delete: playerBaseProcedure
  //   .input(
  //     z.object({
  //       postToDeleteId: z.string(),
  //     })
  //   )
  //   .mutation(async ({ input, ctx }) => {
  //     const post = await prisma.post.findUniqueOrThrow({
  //       where: {
  //         id: input.postToDeleteId,
  //       },
  //     });

  //     if (post.authorId !== ctx.currentPlayer.id) {
  //       throw new TRPCError({
  //         code: "UNAUTHORIZED",
  //         message:
  //           "You can't delete this post because it doesn't belong to your player",
  //       });
  //     }

  //     await prisma.post.delete({
  //       where: {
  //         id: input.postToDeleteId,
  //       },
  //     });
  //   }),
});
