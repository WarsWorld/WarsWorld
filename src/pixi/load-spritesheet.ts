import type {
  ArmySpritesheetData,
  SheetNames,
  SpritesheetDataByArmy,
} from "frontend/components/match/getSpritesheetData";
import { BaseTexture, SCALE_MODES, Spritesheet, utils } from "pixi.js";

export type LoadedSpriteSheet = Record<SheetNames, Spritesheet<ArmySpritesheetData>>;

//This function transforms our RAW spritesheets into finer spritesheets pixi can read well, this is client-side
export async function loadSpritesFromSpriteMap(
  spriteMap: SpritesheetDataByArmy,
): Promise<LoadedSpriteSheet> {
  const pixiSpriteSheets: Partial<LoadedSpriteSheet> = {};

  for (const sheetName in spriteMap) {
    const rawSpriteSheet = spriteMap[sheetName as SheetNames];

    if (rawSpriteSheet !== undefined) {
      if (rawSpriteSheet.meta.image === undefined) {
        throw new Error(`No spritesheet image found for ${sheetName}`);
      }

      const pixiSheet = new Spritesheet<ArmySpritesheetData>(
        BaseTexture.from(`/img/spriteSheet/${rawSpriteSheet.meta.image}`, {
          scaleMode: SCALE_MODES.NEAREST,
        }),
        rawSpriteSheet,
      );
      await pixiSheet.parse();
      pixiSpriteSheets[sheetName as SheetNames] = pixiSheet;
      utils.clearTextureCache();
    }
  }

  return pixiSpriteSheets as LoadedSpriteSheet;
}
