import { z } from "zod";

/**
 * `-1` is neutral
 */
export const playerSlotForPropertiesSchema = z.number().int().min(-1).max(7);
export const playerSlotForUnitsSchema = z.number().int().min(0).max(7);

export type PlayerSlot = z.infer<typeof playerSlotForPropertiesSchema>;
