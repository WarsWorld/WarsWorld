import type { Sprite } from "pixi.js";
import type { ChangeableTile } from "shared/types/server-match-state";

export type ChangeableTileWithSprite = ChangeableTile & { sprite: Sprite | null };
