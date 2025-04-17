import { z } from "zod";

export const playerSchema = z.object({
  name: z
    .string()
    .min(1, "Name cannot be empty.")
    .max(30, "Name exceeds 30 characters.")
    .refine((s) => !s.includes(" "), "name cannot contain spaces."),
  displayName: z
    .string()
    .min(1, "Display name cannot be empty.")
    .max(30, "Display name exceeds 30 characters."),
});
