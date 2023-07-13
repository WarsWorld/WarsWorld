//TODO: Fix TS issues

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { AnimatedSprite, Sprite, Texture } from "pixi.js";
import { positionSchema } from "../server/schemas/position";

export function spriteConstructor(
  texture: Texture,
  x: number,
  y: number,
  width: number,
  height: number,
  eventMode?: Sprite["eventMode"],
  zIndex?: number,
  tint?: string,
) {
  const sprite = new Sprite(texture);
  sprite.x = x;
  sprite.y = y;
  sprite.width = width;
  sprite.height = height;
  if (zIndex) sprite.zIndex = zIndex;
  if (eventMode) sprite.eventMode = eventMode;
  if (tint) sprite.tint = tint;
  return sprite;
};

export function animatedSpriteConstructor(
  texture: Texture[],
  animationSpeed: number,
  x: number,
  y: number,
  width: number,
  height: number,
  eventMode?: Sprite["eventMode"],
  zIndex?: number,
  tint?: string,
) {
  const sprite = new AnimatedSprite(texture);
  sprite.x = x;
  sprite.y = y;
  sprite.width = width;
  sprite.height = height;
  if (zIndex) sprite.zIndex = zIndex;
  if (eventMode) sprite.eventMode = eventMode;
  if (tint) sprite.tint = tint;
  sprite.anchor.set(1, 1);
  sprite.animationSpeed = animationSpeed;
  sprite.play();
  return sprite;
};

export function tileConstructor(position: typeof positionSchema, colour: string) {
  const tile = new Sprite(Texture.WHITE);
  tile.anchor.set(1, 1); //?
  tile.y = (position[0] + 1) * 16;
  tile.x = (position[1] + 1) * 16;
  tile.alpha = 0.5;
  tile.width = 16;
  tile.height = 16;
  tile.eventMode = "static";
  tile.tint = colour;
  return tile;
}