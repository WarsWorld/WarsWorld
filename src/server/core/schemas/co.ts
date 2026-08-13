import { z } from "zod";
import { gameVersionSchema } from "./game-version";

export const coSchema = z.enum([
  "adder",
  "andy",
  "sami",
  "max",
  "hawke",
  "sturm",
  "lash",
  "flak",
  "kanbei",
  "sonja",
  "sensei",
  "colin",
  "drake",
  "eagle",
  "nell",
  "hachi",
  "olaf",
  "grit",
  "jess",
  "kindle",
  "grimm",
  "jake",
  "javier",
  "jugger",
  "koal",
  "von-bolt",
  "sasha",
  "rachel",
]);

export const coIdSchema = z.strictObject({
  name: coSchema,
  version: gameVersionSchema,
});

export type COID = z.infer<typeof coIdSchema>;

export type CO = z.infer<typeof coSchema>;

export const luckRollSchema = z.object({
  goodLuck: z.number().min(0).max(1),
  badLuck: z.number().min(0).max(1),
});

export type LuckRoll = z.infer<typeof luckRollSchema>;
