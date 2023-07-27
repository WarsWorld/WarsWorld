import { z } from "zod";

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
  "rachel"
]);

export type CO = z.infer<typeof coSchema>;
