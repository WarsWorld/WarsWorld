import type { ZodDiscriminatedUnionOption } from "zod";
import { z } from "zod";
import { playerSlotForPropertiesSchema } from "./player-slot";
import { positionSchema } from "./position";

const basicUnitStatsSchema = z.object({
  hp: z.number().int().min(1).max(100),
  fuel: z.number().int().min(0).max(99),
});

export const withNoAmmoUnitStats = {
  stats: basicUnitStatsSchema,
};

export const withAmmoUnitStats = {
  stats: basicUnitStatsSchema.extend({
    ammo: z.number().int().min(0),
  }),
};

export const unitInMapSharedProperties = {
  playerSlot: playerSlotForPropertiesSchema,
  position: positionSchema,
  isReady: z.boolean(),
};

export const withHidden = {
  hidden: z.boolean(),
};

export const withCapturePoints = {
  currentCapturePoints: z.number().positive().optional(),
};

export const withTypeSchema = <T extends string>(input: T) =>
  z.object({
    type: z.literal(input),
  });

export const getLoadedSchema = <
  T extends [ZodDiscriminatedUnionOption<"type">, ...ZodDiscriminatedUnionOption<"type">[]],
>(
  things: T,
) => z.nullable(z.discriminatedUnion("type", things));
