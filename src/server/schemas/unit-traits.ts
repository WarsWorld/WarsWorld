import { z } from "zod";
import { playerSlotForPropertiesSchema } from "./player-slot";
import { positionSchema } from "./position";

const basicUnitStatsSchema = z.object({
  hp: z.number().int().min(1).max(100),
  fuel: z.number().int().min(0).max(99),
});

export const withNoAmmoUnitStatsSchema = z.object({
  stats: basicUnitStatsSchema,
});

export const withAmmoUnitStatsSchema = z.object({
  stats: basicUnitStatsSchema.extend({
    ammo: z.number().int().min(0),
  }),
});

export const withPlayerSlotAndPositionSchema = z.object({
  playerSlot: playerSlotForPropertiesSchema,
  position: positionSchema,
});

export const withHiddenSchema = z.object({
  hidden: z.boolean(),
});
