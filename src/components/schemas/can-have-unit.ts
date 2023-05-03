import { z } from "zod";
import { creatableUnitSchema } from "./unit";

export const canHaveUnitSchema = z.object({
  unit: z.optional(creatableUnitSchema),
});
