import { z } from "zod";

export const positionSchema = z.tuple([
  z.number().nonnegative(),
  z.number().nonnegative(),
]);

export type Position = z.infer<typeof positionSchema>;
