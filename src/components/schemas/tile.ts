import { z } from "zod";
import { unitSchema } from "./unit";
import { armySchema } from "./army";

const canHaveUnitSchema = z.object({
  unit: z.optional(unitSchema),
});

export const propertyTileSchema = canHaveUnitSchema.extend({
  type: z.enum(["base", "airport", "harbor", "hq", "lab", "comtower", "city"]),
  army: armySchema,
});

export type PropertyTile = z.infer<typeof propertyTileSchema>;

export const variableTileSchema = canHaveUnitSchema.extend({
  type: z.enum([
    "road",
    "shoal",
    "bridge",
    "destroyed-seam",
    "pipe",
    "seam",
    "sea",
    "river",
  ]),
  variant: z.number().nonnegative(),
});

export type VariableTile = z.infer<typeof variableTileSchema>;

export const invariableTileSchema = canHaveUnitSchema.extend({
  type: z.enum([
    "plain",
    "forest",
    "mountain",
    "reef",
    "unused-silo",
    "used-silo",
  ]),
});

export type InvariableTile = z.infer<typeof invariableTileSchema>;

export const tileSchema = z.discriminatedUnion("type", [
  propertyTileSchema,
  variableTileSchema,
  invariableTileSchema,
]);

export type Tile = z.infer<typeof tileSchema>;
