import { Sprite, Texture } from "pixi.js";
import type { Position } from "shared/schemas/position";

export function tileConstructor(position: Position, colour: string) {
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
}
