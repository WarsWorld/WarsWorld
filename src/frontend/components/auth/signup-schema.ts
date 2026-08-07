import { z } from "zod";

// Frontend-owned signup form schema (client-side validation for UX). The server re-validates the
// same rules in server/auth/schemas.ts — this is intentionally a small, independent copy so the
// frontend does not import backend code.

export const passwordSchema = z
  .string()
  .min(4, "Password Needs to be at least 4 characters long.")
  .max(40, "Password exceeds 40 characters.");

export const signUpSchema = z.object({
  name: z.string().min(1, "Name is empty."),
  password: passwordSchema,
  email: z.string().min(1, "Email is empty.").email("Invalid email."),
});
