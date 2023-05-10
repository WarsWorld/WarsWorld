import { z } from "zod";

export const withType = <T extends string>(input: T) => ({
  type: z.literal(input),
});
