import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1),
  // TODO: change in prod min from 4 to 8 because I love making passwords called test
  password: z.string().min(4).max(40),
});

export const signUpSchema = loginSchema.extend({
  email: z.string().email(),
});

export type Login = z.infer<typeof loginSchema>;
export type SignUp = z.infer<typeof signUpSchema>;
