import { z } from "zod";
import { unitSchema } from "./unit";
import { variableTileSchema } from "./variable-tiles";

/**
 * `-1` is neutral
 */
export const playerSlotForPropertiesSchema = z.number().min(-1).max(7);
export const playerSlotForUnitsSchema = z.number().min(0).max(7);

export type PlayerSlot = z.infer<typeof playerSlotForPropertiesSchema>;

export const isNeutralProperty = (propertyTile: PropertyTile) =>
  propertyTile.playerSlot === -1;

export const canHaveUnitSchema = z.object({
  unit: z.optional(unitSchema),
});

export const isUnitProducingProperty = (tile: Tile): tile is PropertyTile =>
  tile.type === "base" || tile.type === "airport" || tile.type == "harbor";

export const propertyTileSchema = canHaveUnitSchema.extend({
  type: z.enum(["base", "airport", "harbor", "hq", "lab", "comtower", "city"]),
  playerSlot: playerSlotForPropertiesSchema,
});

export const willBeChangeableTile = (
  tile: Tile,
): tile is PropertyTile | SiloTile =>
  [
    "city",
    "base",
    "airport",
    "harbor",
    "lab",
    "comtower",
    "hq",
    "unused-silo",
  ].includes(tile.type);

export type PropertyTile = z.infer<typeof propertyTileSchema>;

export const siloTileSchema = canHaveUnitSchema.extend({
  type: z.literal("unused-silo"),
});

export type SiloTile = z.infer<typeof siloTileSchema>;

export const invariableTileSchema = canHaveUnitSchema
  .extend({
    type: z.enum(["shoal", "sea", "forest", "mountain", "reef", "used-silo"]),
  })
  .or(siloTileSchema);

export type InvariableTile = z.infer<typeof invariableTileSchema>;

export const tileSchema = z.discriminatedUnion("type", [
  propertyTileSchema,
  ...invariableTileSchema.options,
  ...variableTileSchema.options,
]);

export type Tile = z.infer<typeof tileSchema>;
