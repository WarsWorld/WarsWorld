import { WWMap } from "@prisma/client";
import { Position } from "server/schemas/position";

export class MapWrapper {
  constructor(public data: WWMap) {}

  throwIfOutOfBounds(position: Position) {
    const width = this.data.tiles[0].length;
    const height = this.data.tiles.length;

    if (
      position[0] < 0 ||
      position[0] >= width ||
      position[1] < 0 ||
      position[1] >= height
    ) {
      throw new Error(
        `Out of bounds position ${JSON.stringify(position)} for map ${
          this.data.name
        }`
      );
    }
  }
}
