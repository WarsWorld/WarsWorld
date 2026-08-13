import { baseTileSize } from "frontend/components/match/render-constants";
import type { BoardPosition } from "frontend/components/match/match-view";
import { AnimatedSprite, BitmapText, Container, Sprite, Texture } from "pixi.js";
import type { UnitType } from "shared/schemas/unit";
import type { LoadedSpriteSheet } from "../load-spritesheet";

/**
 * In-board contextual menus for the v2 snapshot board — the pixi equivalent of v1's
 * `createInGameMenu` / `subActionMenu` / `buildUnitMenu`, but decoupled from the engine: they take
 * plain map dimensions and the loaded spritesheets, never a `MatchWrapper`. Anchored at a tile so
 * the action choices live on the board (only turn management stays in the top bar).
 */

type MapSize = { width: number; height: number };

/**
 * Wrap menu elements in a bordered container anchored next to tile `[x, y]` — placed to the right of
 * the tile, flipping to the left past the map's horizontal midpoint, and lifted up when it would
 * overflow the bottom. Mirrors v1's `createInGameMenu` placement so it feels identical.
 */
export const createBoardMenu = (
  { width, height }: MapSize,
  [x, y]: BoardPosition,
  menuHeight: number,
  widthInTiles: number,
  elements: Container[],
): Container => {
  const menu = new Container();
  menu.eventMode = "static";
  menu.sortableChildren = true;
  menu.zIndex = 9999;

  menu.x =
    x > width / 2
      ? x * baseTileSize - baseTileSize * widthInTiles
      : x * baseTileSize + baseTileSize;

  if (y >= height / 2 && height - y < elements.length) {
    menu.y = (y - Math.abs(height - y - elements.length)) * baseTileSize;
  } else {
    menu.y = y * baseTileSize;
  }

  for (const element of elements) {
    menu.addChild(element);
  }

  const background = new Sprite(Texture.WHITE);
  background.tint = "#cacaca";
  background.x = -2;
  background.y = -2;
  background.width = baseTileSize * widthInTiles;
  background.height = menuHeight;
  background.zIndex = -1;
  menu.addChild(background);

  return menu;
};

/** A single text action row (e.g. "ATTACK", "CAPTURE", "WAIT"), stacked by `index`. */
export const createActionMenuElement = (label: string, index: number): Container => {
  const unitSize = baseTileSize / 2;
  const yValue = index * unitSize * 2;

  const element = new Container();
  element.eventMode = "static";
  element.cursor = "pointer";

  const background = new Sprite(Texture.WHITE);
  background.x = 0;
  background.y = yValue;
  background.width = baseTileSize * 2.8;
  background.height = unitSize * 1.35;
  background.eventMode = "static";
  background.tint = "#ffffff";
  background.alpha = 0.5;
  element.addChild(background);

  const text = new BitmapText(label, { fontName: "awFont", fontSize: 10 });
  text.y = yValue;
  text.x = baseTileSize;
  text.anchor.set(0, -0.3);
  element.addChild(text);

  element.on("pointerenter", () => (background.alpha = 1));
  element.on("pointerleave", () => (background.alpha = 0.5));

  return element;
};

/**
 * A single unit row for the build menu: army sprite + name + cost. Unaffordable units render greyed
 * out and are marked non-`selectable` so the caller skips wiring a click handler.
 */
export const createUnitMenuElement = (
  spriteSheet: LoadedSpriteSheet[keyof LoadedSpriteSheet],
  { unitType, cost, selectable }: { unitType: UnitType; cost: number; selectable: boolean },
  index: number,
): Container => {
  const unitSize = baseTileSize / 2;
  const yValue = index * unitSize * 2;

  const element = new Container();
  element.eventMode = "static";

  const background = new Sprite(Texture.WHITE);
  background.x = 0;
  background.y = yValue;
  background.width = baseTileSize * 5.7;
  background.height = unitSize * 1.35;
  background.eventMode = "static";
  background.tint = "#ffffff";
  background.alpha = 0.5;
  element.addChild(background);

  const sprite = new AnimatedSprite(spriteSheet.animations[unitType]);
  sprite.y = yValue;
  sprite.width = unitSize;
  sprite.height = unitSize;
  sprite.animationSpeed = 0.06;
  sprite.anchor.set(-0.2, -0.2);
  sprite.play();
  element.addChild(sprite);

  const name = new BitmapText(unitType.toUpperCase(), { fontName: "awFont", fontSize: 10 });
  name.y = yValue;
  name.x = baseTileSize;
  name.anchor.set(0, -0.3);
  element.addChild(name);

  const costText = new BitmapText(`${cost}`, { fontName: "awFont", fontSize: 10 });
  costText.y = yValue;
  costText.x = baseTileSize * 4;
  costText.anchor.set(0, -0.25);
  element.addChild(costText);

  if (selectable) {
    element.cursor = "pointer";
    element.on("pointerenter", () => (background.alpha = 1));
    element.on("pointerleave", () => (background.alpha = 0.5));
  } else {
    background.tint = "#555555";
    sprite.tint = "#979797";
    sprite.stop();
    name.alpha = 0.75;
    costText.alpha = 0.75;
  }

  return element;
};
