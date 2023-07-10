import { Sprite, Texture } from "pixi.js";
import { Coord } from "./showPathing";

export default function tileConstructor(position: Coord, colour: string) {
  const tile = new Sprite(Texture.WHITE);
  tile.anchor.set(0.5, 1); //?
  tile.y = (position[0] + 1) * 16;
  tile.x = (position[1] + 1) * 16;
  tile.width = 16;
  tile.height = 16;
  tile.eventMode = "static";
  tile.tint = colour;
  return tile;
}