import { BaseTexture, Spritesheet } from "pixi.js";
import { utils } from "pixi.js";
import type { SheetNames, SpriteMap } from "../../gameFunction/get-sprite-sheets";

export type LoadedSpriteSheet = Partial<Record<SheetNames, Spritesheet>>

//This function transforms our RAW spritesheets into finer spritesheets pixi can read well, this is client-side
export async function loadSpritesheets(spriteMap: SpriteMap): Promise<LoadedSpriteSheet> {

  const pixiSpriteSheets: LoadedSpriteSheet = {};

  for (const sheetName in spriteMap) {
    const rawSpriteSheet = spriteMap[sheetName as SheetNames]

    if(rawSpriteSheet !== undefined)
    {
      if (rawSpriteSheet.meta.image === undefined) {
        throw new Error(`No spritesheet image found for ${sheetName}`);
      }

      const pixiSheet = new Spritesheet(
        BaseTexture.from(`/img/spriteSheet/${rawSpriteSheet.meta.image}`),
        rawSpriteSheet);
      await pixiSheet.parse();
      pixiSpriteSheets[sheetName as SheetNames] = pixiSheet;
      utils.clearTextureCache()
    }
  }

  return pixiSpriteSheets;
}
