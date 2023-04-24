import { z } from "zod";

export const armySchema = z.enum([
  "orange-star",
  "blue-moon",
  "yellow-comet",
  "green-earth",
  "black-hole",
]);

export const armyWithNeutralSchema = armySchema.or(z.literal("neutral"));

export type Army = z.infer<typeof armySchema>;
export type ArmyWithNeutral = z.infer<typeof armyWithNeutralSchema>;
