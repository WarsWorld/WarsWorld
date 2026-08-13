import { Sprite, Texture } from "pixi.js";
import type { Position } from "shared/schemas/position";
import { renderedTileSize } from "frontend/components/match/render-constants";

export const tileConstructor = (position: Position, color: string, alpha?: number) => {
  const tile = new Sprite(Texture.WHITE);
  tile.anchor.set(1, 1); //?
  tile.x = ((position[0] + 1) * renderedTileSize) / 2;
  tile.y = ((position[1] + 1) * renderedTileSize) / 2;
  tile.alpha = alpha ?? 0.5;
  tile.width = 16;
  tile.height = 16;
  tile.eventMode = "static";
  tile.tint = color;
  return tile;
};
