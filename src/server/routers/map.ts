import { WWMap, mapSchema } from "components/schemas/map";
import {
  PlayerSlot,
  Tile,
  isNeutralProperty,
  isUnitProducingProperty,
} from "components/schemas/tile";
import { prisma } from "server/prisma";
import { publicProcedure, router } from "../trpc";

const getPlayerAmountOfMap = (map: WWMap) => {
  const seenPlayerSlots: PlayerSlot[] = [];

  const addToPlayerSlotsIfNotAddedAlready = (playerSlot: PlayerSlot) => {
    if (!seenPlayerSlots.includes(playerSlot)) {
      seenPlayerSlots.push(playerSlot);
    }
  };

  for (const tile of map.initialTiles.flat()) {
    if (isUnitProducingProperty(tile) && !isNeutralProperty(tile)) {
      addToPlayerSlotsIfNotAddedAlready(tile.playerSlot);
    }

    if (tile.unit !== undefined) {
      addToPlayerSlotsIfNotAddedAlready(tile.unit.playerSlot);
    }
  }

  return seenPlayerSlots.length;
};

export const mapRouter = router({
  getAll: publicProcedure.query(async () => {
    const allMaps = await prisma.map.findMany();

    return allMaps.map((map) => {
      const tiles = map.tiles as Tile[][];
      const tilesFlat = tiles.flat();

      return {
        name: map.name,
        author: "not implemented",
        numberOfPlayers: map.numberOfPlayers,
        // TODO which armies exactly?
        size: {
          width: tiles[0].length,
          height: tiles.length,
        },
        cities: tilesFlat.filter((tile) => tile.type === "city").length,
        bases: tilesFlat.filter((tile) => tile.type === "base").length,
        harbors: tilesFlat.filter((tile) => tile.type === "harbor").length,
        airports: tilesFlat.filter((tile) => tile.type === "airport").length,
        comtowers: tilesFlat.filter((tile) => tile.type === "comtower").length,
        labs: tilesFlat.filter((tile) => tile.type === "lab").length,
        created: map.createdAt,
      };
    });
  }),
  save: publicProcedure.input(mapSchema).mutation(async ({ input }) => {
    const numberOfPlayers = getPlayerAmountOfMap(input);

    if (numberOfPlayers > 2) {
      throw new Error("Map must be playable by at least 2 players");
    }

    const tiles = input.initialTiles;

    if (tiles.every((row) => row.length === tiles[0].length)) {
      throw new Error("All rows of the map must have the same length");
    }

    return prisma.map.create({
      data: {
        name: input.name,
        tiles: input.initialTiles,
        numberOfPlayers,
      },
    });
  }),
});
