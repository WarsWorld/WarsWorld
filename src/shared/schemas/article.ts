import { z } from "zod";

export const articleType = z.enum([
  "news",
  "guide",
]);

export const guideCategories = z.enum([
  "basics",
  "advance",
  "site",
  "other",
]);

export const newsCategories = z.enum([
  "patch",
  "events",
  "news",
  "maintenance",
  "other",
]);

export const articleWithoutCategory = z.object({
  title: z.string(),
  description: z.string(),
  body: z.string(),
  thumbnail: z.string(),
});

export const articleSchema = z.discriminatedUnion("type", [
  articleWithoutCategory.extend({
    type: z.literal("news"),
    category: newsCategories,
  }),
  articleWithoutCategory.extend({
    type: z.literal("guide"),
    category: guideCategories,
  })
]);

export type ArticleMetaData = z.infer<typeof articleSchema>;