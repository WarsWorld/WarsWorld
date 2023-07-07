import { Sprite, Texture } from "pixi.js";

export default function spriteConstructor(
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
