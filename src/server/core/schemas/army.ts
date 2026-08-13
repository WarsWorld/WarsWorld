import { z } from "zod";

export const armySchema = z.enum([
  "orange-star",
  "blue-moon",
  "green-earth",
  "yellow-comet",
  "black-hole",
  // "red-fire",
  // "grey-sky",
  // "brown-desert",
  // "amber-blaze",
  // "jade-sun",
  // "cobalt-ice",
  // "pink-cosmos",
  // "teal-galaxy",
  // "purple-lighting",
  // "acid-rain",
  // "white-nova",
]);

export const armyWithNeutralSchema = armySchema.or(z.literal("neutral"));

export type Army = z.infer<typeof armySchema>;
export type ArmyWithNeutral = z.infer<typeof armyWithNeutralSchema>;
