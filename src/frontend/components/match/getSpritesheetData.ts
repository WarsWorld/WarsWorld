import type { ISpritesheetData } from "pixi.js";
import type { Army } from "shared/schemas/army";
import type { PropertyTileType } from "shared/schemas/tile";
import type { UnitType } from "shared/schemas/unit";

export type SheetNames = Army | "neutral" | "arrow";

export type SpriteAnimationKeys =
  | PropertyTileType
  | TileAnimationVariants
  | UnitType
  | UnitAnimationVariants;

export type ArmySpritesheetData = ISpritesheetData & {
  animations: Record<SpriteAnimationKeys, undefined>;
};

export type SpritesheetDataByArmy = Record<SheetNames, ArmySpritesheetData>;

type TileAnimationVariants = `${PropertyTileType}_${"rain" | "snow"}`;
type UnitMoveDirection = "down" | "side" | "up";
type UnitAnimationVariants = `${UnitType}-m${UnitMoveDirection}`;
