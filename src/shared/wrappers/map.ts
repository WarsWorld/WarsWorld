import type { WWMap } from "@prisma/client";
import type { Position } from "shared/schemas/position";

export class MapWrapper {
  public width: number;
  public height: number;

  constructor(public data: WWMap) {
    this.width = this.data.tiles[0].length;
    this.height = this.data.tiles.length;
  }

  isOutOfBounds(position: Position) {
    return (
      position[0] < 0 ||
      position[0] >= this.width ||
      position[1] < 0 ||
      position[1] >= this.height
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
