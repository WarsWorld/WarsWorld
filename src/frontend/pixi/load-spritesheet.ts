import { BaseTexture, Spritesheet } from "pixi.js";
import { SheetNames, SpriteMap } from "../../gameFunction/get-sprite-sheets";


export type LoadedSpriteSheet = Record<SheetNames, Spritesheet>

//This function transforms our RAW spritesheets into finer spritesheets pixi can read well, this is client-side
export async function loadSpritesheets(rawSpriteSheet: SpriteMap) {

  const pixiSpriteSheets: LoadedSpriteSheet = {};

  for (const sheetName in rawSpriteSheet) {
    if (rawSpriteSheet[sheetName as SheetNames].meta.image === undefined) {
      throw new Error(`No spritesheet image found for ${sheetName}`);
    }

    const pixiSheet = new Spritesheet(
      BaseTexture.from(`/img/spriteSheet/${rawSpriteSheet[sheetName as SheetNames].meta.image}`),
      rawSpriteSheet[sheetName as SheetNames]);
    await pixiSheet.parse();
    pixiSpriteSheets[sheetName as SheetNames] = pixiSheet;
  }

  return pixiSpriteSheets;
}
