import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().nonempty(),
  password: z.string().min(4).max(12),
});

export const signUpSchema = loginSchema.extend({
  email: z.string().email(),
  confirmPassword: z.string().min(4).max(12),
});

export type ILogin = z.infer<typeof loginSchema>;
export type ISignUp = z.infer<typeof signUpSchema>;
