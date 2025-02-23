import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { ISpritesheetData, ISpritesheetFrameData } from "pixi.js";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const texturePath = path.resolve(__dirname, "AWBW-Replay-Player/AWBWApp.Resources/Textures");

const nations = await fs.readdir(path.resolve(texturePath, "Units"));

// const [someNation] = nations;

// eslint-disable-next-line @typescript-eslint/no-misused-promises
nations.forEach(async (nation) => {
  const spriteSourceType = ["Map/AW2", "Units"] as const;

  const allSprites: { source: (typeof spriteSourceType)[number]; name: string }[] = [];

  for (const source of spriteSourceType) {
    const sprites = await fs.readdir(path.resolve(texturePath, source, nation));
    allSprites.push(...sprites.map((s) => ({ source, name: s })));
  }

  const squareRoot = Math.sqrt(allSprites.length);
  const columns = Math.round(squareRoot);

  if (columns === 0) {
    console.error("no input - spritesheet would be empty");
    process.exit(1);
  }

  const rows = Math.ceil(allSprites.length / columns);

  let cellWidth = 0;
  let cellHeight = 0;

  for (const sprite of allSprites) {
    const { width, height } = await sharp(
      path.resolve(texturePath, sprite.source, nation, sprite.name),
    ).metadata();

    cellWidth = Math.max(cellWidth, width!);
    cellHeight = Math.max(cellHeight, height!);
  }

  const spriteSheetImage = sharp({
    create: {
      width: columns * cellWidth,
      height: rows * cellHeight,
      channels: 4,
      background: {
        r: 0,
        g: 0,
        b: 0,
        alpha: 0,
      },
    },
  });

  const frames: Record<string, ISpritesheetFrameData> = {};

  for (let i = 0; i < allSprites.toSorted((a, b) => (a.name < b.name ? -1 : 1)).length; i++) {
    const sprite = allSprites[i];
    const metadata = await sharp(
      path.resolve(texturePath, sprite.source, nation, sprite.name),
    ).metadata();

    frames[(sprite.source === "Map/AW2" ? "map" : "unit") + "." + sprite.name] = {
      frame: {
        x: (i % columns) * cellWidth,
        y: Math.floor(i / rows) * cellHeight,
        w: metadata.width!,
        h: metadata.height!,
      },
    };
  }

  const animationFrameRegex = /^(.*)-\d+\.png$/i;

  const animationKeys = new Set(
    allSprites
      .map((sprite) => {
        const result = animationFrameRegex.exec(sprite.name);

        if (result?.[1] !== undefined) {
          return {
            source: sprite.source,
            name: result[1],
          };
        } else {
          return null;
        }
      })
      .filter((animationKey) => animationKey !== null) as { source: string; name: string }[],
  );

  const animations: Record<string, string[]> = {};

  for (const { source, name } of animationKeys) {
    animations[(source === "Units" ? "unit" : "map") + "." + name] = allSprites
      .filter((sprite) => sprite.name.startsWith(name))
      .map((sprite) => (sprite.source === "Units" ? "unit" : "map") + "." + sprite.name)
      .toSorted();
  }

  const spriteSheetData: ISpritesheetData = {
    meta: {
      scale: 1,
    },
    frames,
    animations,
  };

  await spriteSheetImage
    .composite(
      Object.entries(frames).map(([key, { frame }]) => {
        const [source, name] = key.split(".");

        let sourcePath = "";

        if (source === "map") {
          sourcePath = "Map/AW2";
        } else if (source === "unit") {
          sourcePath = "Units";
        } else {
          throw new Error(`can't handle this frame key for compositing the file: ${source}`);
        }

        return {
          input: path.resolve(texturePath, sourcePath, nation, name + ".png"),
          left: frame.x,
          top: frame.y,
        };
      }),
    )
    .toFile(path.resolve(__dirname, `output/${nation}.webp`));

  await fs.writeFile(
    path.resolve(__dirname, `output/${nation}.json`),
    JSON.stringify(spriteSheetData, null, 2),
  );
});