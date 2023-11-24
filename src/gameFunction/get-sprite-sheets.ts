import { promises as fs } from "fs";
import path from "path";
import type { ISpritesheetData } from "pixi.js";
import type { Army } from "shared/schemas/army";

export default async function getSpriteSheets(countryNames: Army[]) {
  //Find the absolute path of the json directory

  const jsonDirectory = path.join(process.cwd(), "public/img/spriteSheet");

  const allCountryNames = [...countryNames, "neutral", "arrow"];
  const spritesheetPromises = allCountryNames.map(async (country) => {
    const fileData = await fs.readFile(
      jsonDirectory + `/${country}.json`,
      "utf-8"
    );

    return JSON.parse(fileData) as ISpritesheetData;
  });

  return Promise.all(spritesheetPromises);
}
