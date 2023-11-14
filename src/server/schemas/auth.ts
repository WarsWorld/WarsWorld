import { z } from "zod";

// TODO: better password zod validation

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(4).max(20),
});

export const signUpSchema = loginSchema.extend({
  email: z.string().email(),
  confirmPassword: z.string().min(4).max(20),
});

export type ILogin = z.infer<typeof loginSchema>;
export type ISignUp = z.infer<typeof signUpSchema>;
