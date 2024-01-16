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
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  body: z.string().min(1).max(7500),
  thumbnail: z.string(),
  category: articleCategoriesSchema,
});

export type ArticleMetaData = z.infer<typeof articleSchema>;
export type ArticleCategories = z.infer<typeof articleCategoriesSchema>;
export type ArticleType = z.infer<typeof articleTypeSchema>;