import { baseTileSize } from "components/client-only/MatchRenderer";
import type { FrontendUnit } from "frontend/components/match/FrontendUnit";
import { AnimatedSprite, Container, Sprite, type Spritesheet, Texture } from "pixi.js";
import type { LoadedSpriteSheet } from "./load-spritesheet";
import type { UnitWrapper } from "../shared/wrappers/unit";
import type { ArmySpritesheetData } from "../frontend/components/match/getSpritesheetData";
import type { Position } from "shared/schemas/position";

export function renderUnitSprite(
  unit: FrontendUnit | UnitWrapper,
  spriteSheets: Spritesheet<ArmySpritesheetData>,
  //TODO Do we really need to export 2 spritesheets?
  iconSpriteSheet: Spritesheet,
  newPosition?: Position | null,
) {
  const unitContainer = new Container();
  const unitSprite = new AnimatedSprite(spriteSheets.animations[unit.data.type]);

  let x = unit.data.position[0];
  let y = unit.data.position[1];
  let unitName = `unit-${x}-${y}`;

  //this lets us render at a different position (such as when moving an unit around)
  if (newPosition) {
    x = newPosition[0];
    y = newPosition[1];
    unitName = "tempUnit";
  }

  //TODO: so y'all remember there's a border around the map? units x and y needs to be plussed by that
  unitSprite.x = x * baseTileSize + 8;
  unitSprite.y = y * baseTileSize + 8;
  unitSprite.animationSpeed = 0.07;

  if (!unit.data.isReady) {
    unitSprite.tint = "#bbbbbb";
  }

  unitSprite.play();
  unitContainer.name = unitName;

  //TODO: So frontendunit has a sprite but not unitwrapper.
  // Right now, using something like match.getUnit(position) gets you an unitWrapper unit.
  // Therefore, until we have an easy way to get our frontendunits, we can't use sprite
  //unit.sprite = unitSprite;
  unitContainer.addChild(unitSprite);

  if ("currentCapturePoints" in unit.data && unit.data.currentCapturePoints !== undefined) {
    const smallIcon = new Sprite(iconSpriteSheet?.textures["capturing.png"]);
    smallIcon.x = x * baseTileSize + 8;
    smallIcon.y = y * baseTileSize + 16;
    //TODO: Standardize these sizes
    smallIcon.width = 8;
    smallIcon.height = 8;
    smallIcon.eventMode = "static";
    smallIcon.zIndex = 999;
    unitContainer.addChild(smallIcon);
  }

  return unitContainer;
}
