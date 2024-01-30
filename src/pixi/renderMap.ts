import { baseTileSize } from "components/client-only/MatchRenderer";
import type { FrontendUnit } from "frontend/components/match/FrontendUnit";
import type { SpriteAnimationKeys } from "frontend/components/match/getSpritesheetData";
import type { ChangeableTileWithSprite } from "frontend/components/match/types";
import type { Resource, Texture } from "pixi.js";
import { AnimatedSprite, Container, Sprite } from "pixi.js";
import type { Tile } from "shared/schemas/tile";
import type { ChangeableTile } from "shared/types/server-match-state";
import type { MatchWrapper } from "shared/wrappers/match";
import type { LoadedSpriteSheet } from "./load-spritesheet";

type AnimationsProperty = Record<SpriteAnimationKeys, Texture<Resource>[]>;

function getTileSprite(
  match: MatchWrapper,
  tile: ChangeableTile | Tile,
  spriteSheets: LoadedSpriteSheet,
): Sprite {
  if (!("playerSlot" in tile)) {
    const variant = "variant" in tile ? `-${tile.variant}` : "";
    const key = `${tile.type}${variant}.png`;
    return new Sprite(spriteSheets.neutral.textures[key]);
  }

  if (tile.playerSlot === -1) {
    return new Sprite(spriteSheets.neutral.textures[tile.type + "-0.png"]);
  }

  const player = match.getPlayerBySlot(tile.playerSlot);

  if (player === undefined) {
    throw new Error("Could not find player while rendering tile with playerSlot");
  }

  // for some reason pixi's spritesheet type doesn't index the generic properly, hence overwriting.
  const animations = spriteSheets[player.data.army].animations as AnimationsProperty;
  const tileSprite = new AnimatedSprite(animations[tile.type]);
  tileSprite.animationSpeed = 0.04;
  tileSprite.play();

  return tileSprite;
}

export function renderMap(
  match: MatchWrapper<ChangeableTileWithSprite, FrontendUnit>,
  spriteSheets: LoadedSpriteSheet,
) {
  const mapContainer = new Container(); // TODO add x,y values for margin/border
  mapContainer.x = baseTileSize / 2;
  mapContainer.y = baseTileSize / 2;

  for (let y = 0; y < match.map.data.tiles.length; y++) {
    for (let x = 0; x < match.map.data.tiles[y].length; x++) {
      const tile = match.getTile([x, y]);

      const tileSprite = getTileSprite(match, tile, spriteSheets);

      // makes our sprites render at the bottom, not from the top.
      tileSprite.anchor.set(0, 1);

      tileSprite.x = x * baseTileSize;
      tileSprite.y = (y + 1) * baseTileSize;
      tileSprite.zIndex = y;
      mapContainer.addChild(tileSprite);

      if ("sprite" in tile) {
        tile.sprite = tileSprite;
      }
    }
  }

  //allows for us to use zIndex on the children of mapContainer
  mapContainer.sortableChildren = true;

  return mapContainer;
}
