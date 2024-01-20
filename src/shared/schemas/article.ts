import type { inferRouterOutputs } from "@trpc/server";
import type { articleRouter } from "server/routers/article";
import { z } from "zod";

export const articleTypeSchema = z.enum([
  "news",
  "guide",
]);

export const articleCategoriesSchema = z.enum([
  "basics",
  "advance",
  "site",
  "other",
  "patch",
  "events",
  "news",
  "maintenance",
]);

export const articleSchema = z.object({
  title: z.string().min(1, "Title is empty.").max(100, "Title exceeded 100 characters."),
  description: z.string().min(1, "Description is empty.").max(500, "Description exceeded 500 characters."),
  body: z.string().min(1, "Body is empty.").max(7500, "Body exceeded 7500 characters."),
  thumbnail: z.string().min(1, "Image url is empty.").max(200, "Image url exceeded 200 characters."),
  category: articleCategoriesSchema,
});

export type ArticleMetaData = z.infer<typeof articleSchema>;
export type ArticleCategories = z.infer<typeof articleCategoriesSchema>;
export type ArticleType = z.infer<typeof articleTypeSchema>;
export type ArticleCommentsWithPlayer = NonNullable<inferRouterOutputs<typeof articleRouter>["getMarkdownById"]>["Comments"];
