import { z } from "zod";
import { playerSlotForPropertiesSchema } from "./player-slot";
import { variableTileSchema } from "./variable-tiles";
import { withUnit } from "./unit";

export const isNeutralProperty = (propertyTile: PropertyTile) =>
  propertyTile.playerSlot === -1;

export const isUnitProducingProperty = (tile: Tile): tile is PropertyTile =>
  tile.type === "base" || tile.type === "airport" || tile.type == "port";

export const propertyTileSchema = withUnit.extend({
  type: z.enum(["base", "airport", "port", "hq", "lab", "comtower", "city"]),
  playerSlot: playerSlotForPropertiesSchema,
});

export const willBeChangeableTile = (
  tile: Tile
): tile is PropertyTile | UnusedSiloTile =>
  [
    "city",
    "base",
    "airport",
    "port",
    "lab",
    "comtower",
    "hq",
    "unusedSilo",
  ].includes(tile.type);

export type PropertyTile = z.infer<typeof propertyTileSchema>;

export const unusedSiloTileSchema = withUnit.extend({
  type: z.literal("unusedSilo"),
});

export type UnusedSiloTile = z.infer<typeof unusedSiloTileSchema>;

export const invariableTileSchema = withUnit
  .extend({
    type: z.enum(["shoal", "sea", "forest", "mountain", "reef", "usedSilo"]),
  })
  .or(unusedSiloTileSchema);

export type InvariableTile = z.infer<typeof invariableTileSchema>;

export const tileSchema = z.discriminatedUnion("type", [
  propertyTileSchema,
  ...invariableTileSchema.options,
  ...variableTileSchema.options,
]);

export type TileType = z.infer<typeof tileSchema>["type"];

export type Tile = z.infer<typeof tileSchema>;
