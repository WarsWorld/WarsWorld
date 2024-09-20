import { baseTileSize } from "components/client-only/MatchRenderer";
import type { FrontendUnit } from "frontend/components/match/FrontendUnit";
import { AnimatedSprite, Container, type Spritesheet } from "pixi.js";
import type { LoadedSpriteSheet } from "./load-spritesheet";
import { UnitWrapper } from "../shared/wrappers/unit";
import type { ArmySpritesheetData } from "../frontend/components/match/getSpritesheetData";
import type { Position } from "shared/schemas/position";


export function renderUnitSprite(
  unit: FrontendUnit | UnitWrapper,
  spriteSheets: Spritesheet<ArmySpritesheetData>,
  newPosition?:Position | null,
) {

  const unitSprite = new AnimatedSprite(spriteSheets.animations[unit.data.type]
  );

  let x = unit.data.position[0];
  let y = unit.data.position[1];
  let unitName = `unit-${x}-${y}`;

  //this lets us render at a different position (such as when moving an unit around)
  if (newPosition) {
    x = newPosition[0];
    y = newPosition[1]
    unitName = "unit-ghost";
  }

  //TODO: so y'all remember there's a border around the map? units x and y needs to be plussed by that
  unitSprite.x = x * baseTileSize + 8;
  unitSprite.y = y * baseTileSize + 8;
  unitSprite.animationSpeed = 0.07;

  if (!unit.data.isReady) {
    unitSprite.tint = "#bbbbbb";
  }

  unitSprite.name = unitName;
  unitSprite.play();

  //TODO: So frontendunit has a sprite but not unitwrapper. Right now, using something like match.getUnit(position) gets you an unitWrapper unit. Therefore, until we have an easy way to get our frontendunits, we can't use sprite
  //unit.sprite = unitSprite;

  return unitSprite;
}

/*import { baseTileSize } from "components/client-only/MatchRenderer";
import type { FrontendUnit } from "frontend/components/match/FrontendUnit";
import { AnimatedSprite, Container } from "pixi.js";
import type { LoadedSpriteSheet } from "./load-spritesheet";
import { Army } from "../shared/schemas/army";
import { UnitType } from "../shared/schemas/unit";
import { Position } from "../shared/schemas/position";

export function renderUnitSprite(
  unit: UnitType,
  army: Army,
  position: Position,
  spriteSheets: LoadedSpriteSheet
) {

  const unitSprite = new AnimatedSprite(spriteSheets[army]?.animations[unit]
  );

  //so y'all remember there's a border around the map? units x and y needs to be plussed by that
  unitSprite.x = position[0] * baseTileSize + 8;
  unitSprite.y = position[1] * baseTileSize + 8;
  unitSprite.animationSpeed = 0.07;

  if (!unit.data.isReady) {
    unitSprite.tint = "#bbbbbb";
  }

  let x = position[0];
  let y = position[1];

  //if we need to reference a unit by name (such as after it gets killed), we can get it via getChildByName "unit-x-y"
  unitSprite.name = `unit-${x}-${y}`;

  unitSprite.play();

  //TODO: Why does the unit need to save sprite?
  //unit.sprite = unitSprite;

  return unitSprite;
}


 */