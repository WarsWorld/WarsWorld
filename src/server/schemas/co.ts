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
]);

export type CO = z.infer<typeof coSchema>;
