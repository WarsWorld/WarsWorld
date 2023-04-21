import { z } from "zod";
import { tileSchema } from "./tile";

export const mapSchema = z.object({
  name: z.string(),
  initialTiles: z.array(z.array(tileSchema).nonempty()).nonempty(),
});

export type WWMap = z.infer<typeof mapSchema>;
