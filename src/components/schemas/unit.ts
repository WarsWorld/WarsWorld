import { z } from "zod";
import { positionSchema } from "./position";
import { playerSlotForPropertiesSchema } from "./tile";

export const unitInitialAmmoMap: Partial<Record<UnitType, number>> = {
  mech: 3,
  tank: 9,
};

// TODO
export const unitInitialFuelMap: Record<UnitType, number> = {
  infantry: 99,
  tank: 50,
};

export const unitTypeSchema = z.enum([
  "infantry",
  "mech",
  "recon",
  "apc",
  "artillery",
  "tank",
  "anti-air",
  "attack-copter",
  "missile",
  "rocket",
  "medium-tank",
  "pipe-runner",
  "neo-tank",
  "mega-tank",
]);

export type UnitType = z.infer<typeof unitTypeSchema>;

export const unitSchema = z.object({
  type: unitTypeSchema,
  // missing means hidden
  hp: z.optional(z.number().min(1).max(100)),
  // missing means hidden
  fuel: z.optional(z.number().min(0).max(99)),
  // missing means hidden
  ammo: z.optional(z.number().min(0).max(9)),
  playerSlot: playerSlotForPropertiesSchema,
  position: positionSchema,
});

// TODO special unit type for server match state without hidden

export type Unit = z.infer<typeof unitSchema>;
