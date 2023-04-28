import { z } from "zod";
import { tileSchema } from "./tile";

export const mapSchema = z.object({
  name: z.string(),
  tiles: z.array(z.array(tileSchema).nonempty().max(99)).nonempty().max(99),
});

export type CreatableMap = z.infer<typeof mapSchema>;
