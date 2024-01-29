import type { LoadedSpriteSheet } from "frontend/pixi/load-spritesheet";
import type { Application } from "pixi.js";
import type { MatchWrapper } from "shared/wrappers/match";
import type { FrontendUnit } from "../FrontendUnit";
import type { ChangeableTileWithSprite } from "../types";
import { renderMap } from "./renderMap";
import { renderUnits } from "./renderUnits";

export function setupApp(
  app: Application,
  match: MatchWrapper<ChangeableTileWithSprite, FrontendUnit>,
  renderMultiplier: number,
  spriteSheets: LoadedSpriteSheet,
) {
  app.stage.position.set(0, 0);
  app.stage.sortableChildren = true;
  app.stage.scale.set(renderMultiplier, renderMultiplier);

  const mapContainer = renderMap(match, spriteSheets);
  const unitContainer = renderUnits(match, spriteSheets);

  app.stage.addChild(mapContainer, unitContainer);

  return { mapContainer };
}
