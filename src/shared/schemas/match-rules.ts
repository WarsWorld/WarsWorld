import { z } from "zod";
import { unitTypeSchema } from "./unit";
import { weatherSettingSchema } from "./weather";

export const matchRulesSchema = z.object({
  unitCapPerPlayer: z.number().int().positive(),
  fogOfWar: z.boolean(),
  fundsPerProperty: z.number().int(),
  bannedUnitTypes: unitTypeSchema.array(),
  captureLimit: z.number().int().positive(),
  dayLimit: z.number().int().positive(),
  weatherSetting: weatherSettingSchema,
});

export type MatchRules = z.infer<typeof matchRulesSchema>;
