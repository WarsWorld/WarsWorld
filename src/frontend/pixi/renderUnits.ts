import type { LoadedSpriteSheet } from "frontend/pixi/load-spritesheet";
import { AnimatedSprite, Container } from "pixi.js";
import type { MatchWrapper } from "shared/wrappers/match";
import type { FrontendUnit } from "../components/match/FrontendUnit";
import { baseTileSize } from "../components/match/MatchRenderer";
import type { ChangeableTileWithSprite } from "../components/match/types";

export function renderUnits(
  match: MatchWrapper<ChangeableTileWithSprite, FrontendUnit>,
  spriteSheets: LoadedSpriteSheet,
) {
  const unitContainer = new Container();

  for (const unit of match.units) {
    const unitSprite = new AnimatedSprite(
      spriteSheets["orange-star"]?.animations[unit.properties.displayName.toLowerCase()],
    );

    unitSprite.x = unit.data.position[0] * baseTileSize;
    unitSprite.y = unit.data.position[1] * baseTileSize;
    unitSprite.animationSpeed = 0.07;

    if (!unit.data.isReady) {
      unitSprite.tint = "#bbbbbb";
    }

    // try to make it "centered"
    // unitSprite.anchor.set(-0.2, -0.2);
    unitSprite.play();
    unitContainer.addChild(unitSprite);
    unit.sprite = unitSprite;
  }

  return unitContainer;
}
