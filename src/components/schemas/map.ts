import { z } from "zod";
import { tileSchema } from "./tile";

export const mapSchema = z.object({
  name: z.string(),
  initialTiles: z
    .array(z.array(tileSchema).nonempty().max(99))
    .nonempty()
    .max(99),
});

export type WWMap = z.infer<typeof mapSchema>;
