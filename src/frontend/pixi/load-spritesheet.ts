import type { ISpritesheetData } from "pixi.js";
import { BaseTexture, Spritesheet } from "pixi.js";

export async function loadSpritesheets(spritesheetDatas: ISpritesheetData[]) {
  const spritesheets = spritesheetDatas.map((spritesheetData) => {
    if (spritesheetData.meta.image === undefined) {
      throw new Error("No spritesheet thing");
    }

    /**
     * This stupid patch is needed because our data is not "well typed"
     * which is kind of impossible to achieve with tons of filenames
     * that we might not want to store anywhere in TS files.
     * Without this type information, because of Pixi's type definitions,
     * the `spritesheet.animations` property becomes `Record<never, Texture[]>`
     * or something like that.
     */
    type AnimationsPropertPatch = { animations: Record<string, string[]> };

    return new Spritesheet(
      BaseTexture.from(spritesheetData.meta.image),
      spritesheetData as ISpritesheetData & AnimationsPropertPatch
    );
  });

  await Promise.all(spritesheets.map((sheet) => sheet.parse()));

  return spritesheets;
}
