import { z } from "zod";
import { unitSchema } from "./unit";

export const canHaveUnitSchema = z.object({
  unit: z.optional(unitSchema),
});