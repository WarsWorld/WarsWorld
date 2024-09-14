import { baseTileSize } from "components/client-only/MatchRenderer";
import type { FrontendUnit } from "frontend/components/match/FrontendUnit";
import type { ChangeableTileWithSprite } from "frontend/components/match/types";
import { AnimatedSprite, Container } from "pixi.js";
import type { MatchWrapper } from "shared/wrappers/match";
import type { LoadedSpriteSheet } from "./load-spritesheet";

export function renderUnits(
  match: MatchWrapper<ChangeableTileWithSprite, FrontendUnit>,
  spriteSheets: LoadedSpriteSheet,
) {
  const unitContainer = new Container();

  for (const unit of match.units) {
    const unitSprite = new AnimatedSprite(spriteSheets[unit.player.data.army]?.animations[unit.data.type],
    );

    //so y'all remember there's a border around the map? units x and y needs to be plussed by that
    unitSprite.x = unit.data.position[0] * baseTileSize + 8;
    unitSprite.y = unit.data.position[1] * baseTileSize + 8;
    unitSprite.animationSpeed = 0.07;

    if (!unit.data.isReady) {
      unitSprite.tint = "#bbbbbb";
    }

    unitSprite.play();
    unitContainer.addChild(unitSprite);
    unit.sprite = unitSprite;
  }

  return unitContainer;
}
