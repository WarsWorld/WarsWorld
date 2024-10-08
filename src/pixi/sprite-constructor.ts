import { Sprite, Texture } from "pixi.js";
import type { Position } from "shared/schemas/position";

export const tileConstructor = (position: Position, colour: string) => {
  const tile = new Sprite(Texture.WHITE);
  tile.anchor.set(1, 1); //?
  tile.x = (position[0] + 1) * 16;
  tile.y = (position[1] + 1) * 16;
  tile.alpha = 0.5;
  tile.width = 16;
  tile.height = 16;
  tile.eventMode = "static";
  tile.tint = colour;
  return tile;
};

export const interactiveTileConstructor = (
  position: Position,
  colour: string,
  hoverBehaviour?: (position: Position) => void,
  clickBehaviour?: (positoin: Position) => void,
) => {
  const tile = tileConstructor(position, colour);

  tile.eventMode = "dynamic";

  if (hoverBehaviour) {
    tile.on("mouseover", () => hoverBehaviour(position));
  }

  if (clickBehaviour) {
    tile.on("pointerdown", () => clickBehaviour(position));
  }

  return tile;
};
