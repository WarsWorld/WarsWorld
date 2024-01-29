import { z } from "zod";
import { tileSchema } from "./tile";
import { unitSchema } from "./unit";

const tileRowSchema = z.array(tileSchema).nonempty().max(99);

export const mapSchema = z.object({
  name: z.string(),
  tiles: z.array(tileRowSchema).nonempty().max(99),
  predeployedUnits: z.array(unitSchema),
});

export type CreatableMap = z.infer<typeof mapSchema>;
