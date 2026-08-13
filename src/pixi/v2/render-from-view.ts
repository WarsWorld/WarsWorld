import { baseTileSize, mapBorder } from "components/client-only/MatchRenderer";
import type { SpriteAnimationKeys } from "frontend/components/match/getSpritesheetData";
import type {
  BoardPosition,
  MatchChangeableTile,
  MatchTile,
  MatchUnit,
  MatchView,
} from "frontend/components/match/match-view";
import { getArmyForSlot, getTileAt, visualHP } from "frontend/components/match/match-view";
import type { Resource } from "pixi.js";
import { AnimatedSprite, Container, Sprite, Texture } from "pixi.js";
import type { LoadedSpriteSheet } from "../load-spritesheet";

/**
 * Snapshot-driven (v2) board rendering — draws map, units, and an interactive tile grid straight
 * from the plain `MatchView` the backend sends. No engine, no `MatchWrapper`: the client renders
 * BE state, it does not compute it. This is the render half of the Phase-C cut.
 */

type AnimationsProperty = Record<SpriteAnimationKeys, Texture<Resource>[]>;

const tileSprite = (
  match: MatchView,
  tile: MatchTile | MatchChangeableTile,
  spriteSheets: LoadedSpriteSheet,
): Sprite => {
  if (!("playerSlot" in tile)) {
    let spriteName: string = tile.type;

    if ("fired" in tile && tile.fired) {
      spriteName = "usedSilo";
    }

    if ("variant" in tile) {
      spriteName += `-${tile.variant}`;
    }

    return new Sprite(spriteSheets.neutral.textures[`${spriteName}.png`]);
  }

  if (tile.playerSlot === -1) {
    return new Sprite(spriteSheets.neutral.textures[tile.type + "-0.png"]);
  }

  const army = getArmyForSlot(match, tile.playerSlot);

  if (army === undefined) {
    throw new Error("Could not find player while rendering tile with playerSlot");
  }

  // pixi's spritesheet type doesn't index the generic properly, hence the cast.
  const animations = spriteSheets[army].animations as AnimationsProperty;
  const sprite = new AnimatedSprite(animations[tile.type]);
  sprite.animationSpeed = 0.04;
  sprite.play();

  return sprite;
};

export const renderMapFromView = (match: MatchView, spriteSheets: LoadedSpriteSheet): Container => {
  const mapContainer = new Container();
  mapContainer.x = mapBorder;
  mapContainer.y = mapBorder;

  for (let y = 0; y < match.map.tiles.length; y++) {
    for (let x = 0; x < match.map.tiles[y].length; x++) {
      const sprite = tileSprite(match, getTileAt(match, [x, y]), spriteSheets);

      sprite.anchor.set(0, 1); // render from the bottom, not the top
      sprite.x = x * baseTileSize;
      sprite.y = (y + 1) * baseTileSize;
      sprite.zIndex = y;
      mapContainer.addChild(sprite);
    }
  }

  mapContainer.sortableChildren = true;

  return mapContainer;
};

const createIcon = (
  spriteSheet: LoadedSpriteSheet,
  x: number,
  y: number,
  texture: string,
): Sprite => {
  const icon = new Sprite(spriteSheet.icons?.textures[texture]);
  icon.x = x;
  icon.y = y;
  icon.width = 8;
  icon.height = 8;
  icon.eventMode = "static";
  icon.zIndex = 999;

  return icon;
};

export const renderUnitFromView = (
  unit: MatchUnit,
  army: MatchView["players"][number]["army"],
  spriteSheets: LoadedSpriteSheet,
  // A phantom is buffered intent the BE hasn't confirmed yet — drawn translucent so it reads as
  // "pending" rather than as a settled unit. It hardens into a normal sprite once the action confirms.
  phantom = false,
): Container => {
  const [x, y] = unit.position;
  const spriteX = x * baseTileSize + 8;
  const spriteY = y * baseTileSize + 8;

  const unitContainer = new Container();
  unitContainer.name = `unit-${x}-${y}`;

  const unitSprite = new AnimatedSprite(spriteSheets[army].animations[unit.type]);
  unitSprite.x = spriteX;
  unitSprite.y = spriteY;
  unitSprite.animationSpeed = 0.07;

  if (!unit.isReady) {
    unitSprite.tint = "#bbbbbb";
  }

  if (phantom) {
    unitContainer.alpha = 0.6;
  }

  // A dived sub / hidden stealth shows translucent so the owner can tell it's submerged.
  if ("hidden" in unit && unit.hidden) {
    unitSprite.alpha = 0.5;
  }

  unitSprite.play();
  unitContainer.addChild(unitSprite);

  if ("currentCapturePoints" in unit && unit.currentCapturePoints !== undefined) {
    unitContainer.addChild(createIcon(spriteSheets, spriteX, spriteY + 8, "capturing.png"));
  }

  const hp = visualHP(unit);

  if (hp !== undefined && hp !== 10) {
    unitContainer.addChild(createIcon(spriteSheets, spriteX + 8, spriteY + 8, `health-${hp}.png`));
  }

  // Cargo indicator: a transport shows a mini sprite of each unit it carries in its top-left corner,
  // so it's clear it's loaded and WHICH units are inside (they belong to the same owner/army).
  const cargoTypes: MatchUnit["type"][] = [];

  if ("loadedUnit" in unit && unit.loadedUnit) {
    cargoTypes.push(unit.loadedUnit.type);
  }

  if ("loadedUnit2" in unit && unit.loadedUnit2) {
    cargoTypes.push(unit.loadedUnit2.type);
  }

  if (cargoTypes.length > 0) {
    const cargoSize = baseTileSize / 2;
    const backing = new Sprite(Texture.WHITE);
    backing.tint = "#000000";
    backing.alpha = 0.5;
    backing.x = spriteX;
    backing.y = spriteY;
    backing.width = cargoSize * cargoTypes.length;
    backing.height = cargoSize;
    unitContainer.addChild(backing);

    cargoTypes.forEach((cargoType, index) => {
      const mini = new Sprite(spriteSheets[army].animations[cargoType][0]);
      mini.width = cargoSize;
      mini.height = cargoSize;
      mini.x = spriteX + index * cargoSize;
      mini.y = spriteY;
      unitContainer.addChild(mini);
    });
  }

  return unitContainer;
};

export const renderUnitsFromView = (
  match: MatchView,
  spriteSheets: LoadedSpriteSheet,
  // Tiles whose unit is buffered (unconfirmed) intent — drawn as phantoms. Empty = nothing pending.
  phantomPositions: readonly BoardPosition[] = [],
): Container => {
  const unitContainer = new Container();
  const isPhantom = (position: BoardPosition) =>
    phantomPositions.some((phantom) => phantom[0] === position[0] && phantom[1] === position[1]);

  for (const unit of match.units) {
    const army = getArmyForSlot(match, unit.playerSlot);

    if (army !== undefined) {
      unitContainer.addChild(
        renderUnitFromView(unit, army, spriteSheets, isPhantom(unit.position)),
      );
    }
  }

  return unitContainer;
};

/**
 * A translucent overlay marking a set of tiles (e.g. a unit's reachable tiles). Positioned exactly
 * like the map tiles so it lines up; caller adds it to the map container so units still render on top.
 */
export const renderHighlightTiles = (
  positions: readonly BoardPosition[],
  color: string,
): Container => {
  const container = new Container();
  container.zIndex = 1000; // above the map tiles (which use zIndex = y), below the units container
  container.name = "v2-highlights";

  for (const [x, y] of positions) {
    const sprite = new Sprite(Texture.WHITE);
    sprite.tint = color;
    sprite.alpha = 0.4;
    sprite.width = baseTileSize;
    sprite.height = baseTileSize;
    sprite.anchor.set(0, 1);
    sprite.x = x * baseTileSize;
    sprite.y = (y + 1) * baseTileSize;
    container.addChild(sprite);
  }

  return container;
};

export const renderInteractiveTilesFromView = (
  match: MatchView,
  onTileClick: (pos: BoardPosition) => void,
  onTileHover: (pos: BoardPosition) => void,
): Container => {
  const container = new Container();
  container.x = baseTileSize / 2;
  container.y = baseTileSize / 2;

  for (let y = 0; y < match.map.tiles.length; y++) {
    for (let x = 0; x < match.map.tiles[y].length; x++) {
      const sprite = new Sprite(Texture.EMPTY);
      sprite.height = baseTileSize;
      sprite.width = baseTileSize;
      sprite.anchor.set(0, 1);
      sprite.x = x * baseTileSize;
      sprite.y = (y + 1) * baseTileSize;
      sprite.interactive = true;
      sprite.on("pointertap", () => onTileClick([x, y]));
      sprite.on("pointerenter", () => onTileHover([x, y]));
      container.addChild(sprite);
    }
  }

  container.sortableChildren = true;

  return container;
};
