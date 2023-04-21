import { mapSchema } from "components/schemas/map";
import { Tile } from "components/schemas/tile";
import { prisma } from "server/prisma";
import { publicProcedure, router } from "../trpc";

const validateTile = (tile: Tile) => {
  switch (tile.type) {
    case "pipe":
    case "seam": {
      if (tile.unit === undefined) {
        return;
      }

      if (tile.unit.type === "pipe-runner") {
        return;
      }

      throw new Error("Only pipe-runners can be on top of pipes or seams");
    }
  }
};

export const mapRouter = router({
  save: publicProcedure.input(mapSchema).mutation(async ({ input }) => {
    input.initialTiles.flat().forEach(validateTile);

    return await prisma.map.create({
      data: {
        name: input.name,
        tiles: input.initialTiles,
      },
    });
  }),
});
