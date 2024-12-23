import type { FrontendUnit } from "frontend/components/match/FrontendUnit";
import type { ChangeableTileWithSprite } from "frontend/components/match/types";
import { AnimatedSprite, Container } from "pixi.js";
import type { MatchWrapper } from "shared/wrappers/match";
import type { LoadedSpriteSheet } from "./load-spritesheet";
import { renderUnitSprite } from "./renderUnitSprite";

export function renderUnits(
  match: MatchWrapper<ChangeableTileWithSprite, FrontendUnit>,
  spriteSheets: LoadedSpriteSheet,
) {
  const unitContainer = new Container();

  for (const unit of match.units) {
    unitContainer.addChild(renderUnitSprite(unit, spriteSheets));
  }

  return unitContainer;
}
