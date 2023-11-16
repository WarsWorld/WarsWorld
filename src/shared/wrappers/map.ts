import type { WWMap } from "@prisma/client";
import type { Position } from "server/schemas/position";

export class MapWrapper {
  constructor(public data: WWMap) {}

  isOutOfBounds(position: Position) {
    const width = this.data.tiles[0].length;
    const height = this.data.tiles.length;

    return (
      position[0] < 0 ||
      position[0] >= width ||
      position[1] < 0 ||
      position[1] >= height
    );
  }

  throwIfOutOfBounds(position: Position) {
    if (this.isOutOfBounds(position)) {
      throw new Error(
        `Out of bounds position ${JSON.stringify(position)} for map ${
          this.data.name
        }`
      );
    }
  }
}
