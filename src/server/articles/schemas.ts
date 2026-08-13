import { z } from "zod";

// Article validation (server-authoritative), owned by the `articles` feature — not the game
// engine. The frontend has its own form schema and derives comment types via tRPC inference, so
// this file no longer needs the old `articleRouter` type import (which was a shared -> server leak).

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
  title: z.string().min(1, "Title is empty.").max(100, "Title exceeds 100 characters."),
  description: z
    .string()
    .min(1, "Description is empty.")
    .max(500, "Description exceeds 500 characters."),
  body: z.string().min(1, "Content is empty.").max(7500, "Content exceeds 7500 characters."),
  thumbnail: z.string().min(1, "Image url is empty.").max(200, "Image url exceeds 200 characters."),
  category: articleCategoriesSchema,
});

export const articleCommentSchema = z.object({
  comment: z.string().min(1, "Comment is empty.").max(5000, "Comment exceeds 5000 characters."),
  articleId: z.number().min(1),
});

export type ArticleCategories = z.infer<typeof articleCategoriesSchema>;
