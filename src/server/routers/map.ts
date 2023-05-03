import { CreatableMap, mapSchema } from "components/schemas/map";
import {
  Tile,
  isNeutralProperty,
  isUnitProducingProperty,
} from "components/schemas/tile";
import { prisma } from "server/prisma/prisma-client";
import { publicBaseProcedure, router } from "../trpc/trpc-setup";
import { PlayerSlot } from "components/schemas/player-slot";

export const getPlayerAmountOfMap = (map: CreatableMap) => {
  const seenPlayerSlots: PlayerSlot[] = [];

  const addToPlayerSlotsIfNotAddedAlready = (playerSlot: PlayerSlot) => {
    if (!seenPlayerSlots.includes(playerSlot)) {
      seenPlayerSlots.push(playerSlot);
    }
  };

  for (const tile of map.tiles.flat()) {
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
        name: input.name,
        tiles: input.tiles,
        numberOfPlayers,
      },
    });
  }),
});
