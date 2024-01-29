import { promises as fs } from "fs";
import path from "path";
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

export default async function getSpriteSheets(countryNames: Army[]): Promise<SpritesheetDataByArmy> {
  const jsonDirectory = path.join(process.cwd(), "public/img/spriteSheet");

  const returnObj: Partial<SpritesheetDataByArmy> = {};
  const allCountryNames: SheetNames[] =  [...countryNames, "neutral", "arrow"];

  for (const country of allCountryNames) {
    const fileData = await fs.readFile(
      `${jsonDirectory}/${country}.json`,
      "utf-8"
    );
    returnObj[country] = JSON.parse(fileData) as ArmySpritesheetData;
  }

  return returnObj as SpritesheetDataByArmy;
}

