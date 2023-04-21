import { z } from "zod";

export const armySchema = z.enum([
  "orange-star",
  "blue-moon",
  "neutral",
  "yellow-comet",
  "green-earth",
  "black-hole",
]);

export type Army = z.infer<typeof armySchema>;
