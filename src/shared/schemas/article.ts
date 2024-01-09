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
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  body: z.string().min(1).max(7500),
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
  }),
]);

export type ArticleMetaData = z.infer<typeof articleSchema>;