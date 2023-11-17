import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(8).max(40),
});

export const signUpSchema = loginSchema.extend({
  email: z.string().email(),
});

export type Login = z.infer<typeof loginSchema>;
export type SignUp = z.infer<typeof signUpSchema>;
