import { z } from "zod";
import { armySchema } from "./army";
import { positionSchema } from "./position";

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
  army: armySchema,
  position: positionSchema,
});

export type Unit = z.infer<typeof unitSchema>;
