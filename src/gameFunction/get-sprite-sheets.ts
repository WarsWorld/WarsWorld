import { promises as fs } from "fs";
import path from "path";
import type { ISpritesheetData } from "pixi.js";
import type { Army } from "shared/schemas/army";

//export type AnimationsPropertyPatch = { animations: Record<string, string[]> };

export type SheetNames = Army | "neutral" | "arrow"

export type SpriteMap = Record<Army | "neutral" | "arrow", (ISpritesheetData)>;

//this function is getting all the json spritesheets, nothing else, this happens on the server side
export default async function getSpriteSheets(countryNames: Army[]): Promise<SpriteMap> {
  const jsonDirectory = path.join(process.cwd(), "public/img/spriteSheet");

  const returnObj: SpriteMap   = {};
  const allCountryNames: SheetNames[] =  [...countryNames, "neutral", "arrow"];

  for (const country of allCountryNames) {
    const fileData = await fs.readFile(
      `${jsonDirectory}/${country}.json`,
      "utf-8"
    );
    returnObj[country] = JSON.parse(fileData) as ISpritesheetData;
  }

  return returnObj;
}

