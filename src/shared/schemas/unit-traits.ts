import { z } from "zod";
import { playerSlotForPropertiesSchema } from "./player-slot";
import { positionSchema } from "./position";

const basicUnitStatsSchema = z.object({
  hp: z.number().int().min(1).max(100),
  fuel: z.number().int().min(0).max(99)
});

export const withNoAmmoUnitStatsSchema = z.object({
  stats: basicUnitStatsSchema
});

export const withAmmoUnitStatsSchema = z.object({
  stats: basicUnitStatsSchema.extend({
    ammo: z.number().int().min(0)
  })
});

type WithAmmoStats = z.infer<typeof withAmmoUnitStatsSchema>["stats"];
export type StatsKey = keyof WithAmmoStats;

export const unitInMapSharedPropertiesSchema = z.object({
  playerSlot: playerSlotForPropertiesSchema,
  position: positionSchema,
  isReady: z.boolean()
});

export const withHiddenSchema = z.object({
  hidden: z.boolean()
});
