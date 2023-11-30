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
  /**
   * indexes are playerSlots of the map, values are the team
   * the slot is assigned to.
   * 
   * team indexes start at 0, playerSlots as well but -1 is special value for neutral properties
   */
  teamMapping: z.array(z.number().int().nonnegative())
});

export type MatchRules = z.infer<typeof matchRulesSchema>;
