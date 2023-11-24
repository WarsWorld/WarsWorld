import { prisma } from "server/prisma/prisma-client";
import type { CreatableMap } from "shared/schemas/map";
import { mapSchema } from "shared/schemas/map";
import type { PlayerSlot } from "shared/schemas/player-slot";
import type { Tile, TileType } from "shared/schemas/tile";
import {
  isNotNeutralProperty,
  isUnitProducingProperty
} from "shared/schemas/tile";
import { publicBaseProcedure, router } from "../trpc/trpc-setup";

export const getPlayerAmountOfMap = (map: CreatableMap) => {
  const seenPlayerSlots: PlayerSlot[] = [];

  const addToPlayerSlotsIfNotAddedAlready = (item: {
    playerSlot: PlayerSlot;
  }) => {
    if (!seenPlayerSlots.includes(item.playerSlot)) {
      seenPlayerSlots.push(item.playerSlot);
    }
  };

  map.tiles
    .flat()
    .filter(isUnitProducingProperty)
    .filter(isNotNeutralProperty)
    .forEach(addToPlayerSlotsIfNotAddedAlready);

  map.predeployedUnits.forEach(addToPlayerSlotsIfNotAddedAlready);

  return seenPlayerSlots.length;
};

/**
 * This is the list of tile types that are shown
 * on the map list.
 */
const propertyTileTypes = [
  "city",
  "base",
  "airport",
  "commtower",
  "lab",
  "port"
] satisfies TileType[];

type PropertyStatsType = Record<(typeof propertyTileTypes)[number], number>;

export const mapRouter = router({
  getAll: publicBaseProcedure.query(async () => {
    const allMaps = await prisma.wWMap.findMany();

    return allMaps.map((map) => {
      const tiles = map.tiles as Tile[][];
      const tilesFlat = tiles.flat();

      return {
        id: map.id,
        name: map.name,
        author: "not implemented",
        numberOfPlayers: map.numberOfPlayers,
        // TODO which armies exactly?
        size: {
          width: tiles[0].length,
          height: tiles.length
        },
        propertyStats: propertyTileTypes.reduce<PropertyStatsType>(
          (prev, cur) => ({
            ...prev,
            [cur]: tilesFlat.filter((tile) => tile.type === cur).length
          }),
          {} as PropertyStatsType
        ),
        created: map.createdAt
      };
    });
  }),
  save: publicBaseProcedure.input(mapSchema).mutation(async ({ input }) => {
    const numberOfPlayers = getPlayerAmountOfMap(input);

    if (numberOfPlayers > 2) {
      throw new Error("Map must be playable by at least 2 players");
    }

    const tiles = input.tiles;

    if (tiles.every((row) => row.length === tiles[0].length)) {
      throw new Error("All rows of the map must have the same length");
    }

    return prisma.wWMap.create({
      data: {
        ...input,
        numberOfPlayers
      }
    });
  })
});
