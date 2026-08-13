import { z } from "zod";

// Frontend-owned article form schemas (client-side validation for UX). The server re-validates the
// same rules in server/articles/schemas.ts — a small independent copy so the frontend does not
// import backend code.

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
