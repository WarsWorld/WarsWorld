import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ISpritesheetData, ISpritesheetFrameData } from "pixi.js";
import sharp from "sharp";
import yargs from "yargs";

// configurable parameters
const { texturesBasePath, outputPath } = yargs(process.argv.slice(2))
  .option('texturesBasePath', {
    alias: 't', // -t
    type: 'string',
    description: 'Path to obtain textures at',
    default: 'AWBW-Replay-Player/AWBWApp.Resources/Textures',
  })
  .option('outputPath', {
    alias: 'o',
    type: 'string',
    description: 'Path to save processed sprites to',
    default: 'output',
  }).argv as { texturesBasePath: string, outputPath: string };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const nations = await fs.readdir(path.resolve(__dirname, texturesBasePath, "Units"));

const spriteSources = {
  map: "Map/AW2",
  unit: "Units",
} as const;
type SpriteType = keyof typeof spriteSources;
type Sprite = {
  type: SpriteType
  name: string;
}

// _eslint-disable-next-line @typescript-eslint/no-misused-promises
nations.forEach(async (nation) => {
  // fetch sprites
  const allSprites = await getAllSprites(nation);
  // generate frames and spritesheet image
  const {frames, spriteSheetImage} = await genFramesAndSpriteSheetImage(nation, allSprites);
  // fetch animations map
  const animations = await fetchAnimations(allSprites, frames);

  // write WebP files
  await spriteSheetImage
    .composite(
      Object.entries(frames).map(([key, { frame }]) => {
        const [source, name] = key.split(".");

        if (!(source === "map" || source === "unit"))
          throw new Error(`can't handle this frame key for compositing the file: ${source}`);

        return {
          input: getTexturePath(source, nation, name + ".png"),
          left: frame.x,
          top: frame.y,
        };
      }),
    )
    .toFile(path.resolve(__dirname, outputPath, `${nation}.webp`));

  // write JSON files
  const spriteSheetData: ISpritesheetData = {
    meta: {scale: 1},
    frames,
    animations,
  };
  await fs.writeFile(
    path.resolve(__dirname, outputPath, `${nation}.json`),
    JSON.stringify(spriteSheetData, null, 2),
  );
});

function getTexturePath(spriteType: SpriteType, spriteNation: string, spriteName: string | null = null) {
  return path.resolve(
    __dirname,
    texturesBasePath, // e.g. AWBW-Replay-Player/AWBWApp.Resources/Textures
    spriteSources[spriteType], // e.g. Units
    spriteNation, // e.g. OrangeStar
    spriteName || "" // e.g. APC_MSide-2.png
  );
}

async function getAllSprites(nation: string) : Promise<Sprite[]> {
  /**
   * Returns an array with the paths of all sprites
   * For example, if we find AWBW-Replay-Player/AWBWApp.Resources/Textures/Units/OrangeStar/APC_MSide-2.png,
   *   we generate {unit, APC_MSide-2} : Sprite
   */
  const allSprites: Sprite[] = [];

  for (const spriteType of Object.keys(spriteSources) as SpriteType[]) { // TODO a better way to do this
    const sprites = await fs.readdir(getTexturePath(spriteType, nation));
    allSprites.push(...sprites.map((s) : Sprite => ({ type: spriteType, name: s })));
  }

  if (allSprites.length === 0)
      throw new Error('No input - spritesheet would be empty.');
  return allSprites;
}

async function genFramesAndSpriteSheetImage(nation: string, allSprites: Sprite[])
  : Promise<{ frames: Record<string, ISpritesheetFrameData>; spriteSheetImage: sharp.Sharp }> {
  /**
   * Generates frames with appropriate dimensions for given sprites
   */
  const columnsCount = Math.round(Math.sqrt(allSprites.length));
  const rowsCount = Math.ceil(allSprites.length / columnsCount);

  // compute max cell width and height
  let cellWidth = 0;
  let cellHeight = 0;
  for (const sprite of allSprites) {
    const { width, height } = await sharp(
      // example: .../Textures/Units/OrangeStar/APC_MSide-1.png
      getTexturePath(sprite.type, nation, sprite.name),
    ).metadata();

    cellWidth = Math.max(cellWidth, width!);
    cellHeight = Math.max(cellHeight, height!);
  }

  // start building the spritesheet image
  const spriteSheetImage = sharp({
    create: {
      width: columnsCount * cellWidth,
      height: rowsCount * cellHeight,
      channels: 4,
      background: {r: 0, g: 0, b: 0,alpha: 0},
    },
  });

  // build the frames
  const frames: Record<string, ISpritesheetFrameData> = {};
  for (let i = 0; i < allSprites.toSorted((a, b) => (a.name < b.name ? -1 : 1)).length; i++) {
    const sprite = allSprites[i];
    const metadata = await sharp(
      getTexturePath(sprite.type, nation, sprite.name),
    ).metadata();

    frames[sprite.type + "." + sprite.name] = {
      frame: {
        x: (i % columnsCount) * cellWidth,
        y: Math.floor(i / rowsCount) * cellHeight,
        w: metadata.width!,
        h: metadata.height!,
      },
    };
  }
  return { spriteSheetImage, frames };
}

async function fetchAnimations(allSprites: Sprite[], frames: Record<string, ISpritesheetFrameData>)
  : Promise<Record<string, string[]>> {
  const animationFrameRegex = /^(.*)-\d+\.png$/i; // capture pattern "Airport-1.png"
  const animationKeys = new Set(
    allSprites.map((sprite) => {
        const result = animationFrameRegex.exec(sprite.name);

        if (result?.[1] !== undefined) {
          return {
            source: sprite.type,
            name: result[1],
          };
        } else return null;
      })
      .filter((animationKey) => animationKey !== null) as { source: string; name: string }[],
  );

  const animations: Record<string, string[]> = {};
  for (const { source, name } of animationKeys) {
    animations[source + "." + name] = allSprites
      .filter((sprite) => sprite.name.startsWith(name))
      .map((sprite) => sprite.type + "." + sprite.name)
      .toSorted();
  }
  return animations;
}
