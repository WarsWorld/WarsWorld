import { AnimatedSprite, Container, Spritesheet } from "pixi.js";
import { CreatableUnit } from "../server/schemas/unit";
import { Tile } from "../server/schemas/tile";
import {showAttackableTiles, showPassableTiles} from "./showPathing";

export function getUnitSprite(
  spriteSheet: Spritesheet,
  unit: CreatableUnit
): AnimatedSprite {
  const unitSprite = new AnimatedSprite(spriteSheet.animations[unit.type]);
  unitSprite.y = (unit.position[0] + 1) * 16;
  unitSprite.x = (unit.position[1] + 1) * 16;
  unitSprite.width = 16;
  unitSprite.height = 16;
  unitSprite.animationSpeed = 0.07;
  // try to make it "centered"
  unitSprite.anchor.set(0.5, 1); //?
  unitSprite.play();
  return unitSprite;
}

export function showUnits(
  spriteSheets: Spritesheet[],
  mapData: Tile[][],
  units: CreatableUnit[]
) {
  const mapContainer = new Container();
  mapContainer.eventMode = "static";

  for (const unit of units) {
    const unitContainer = new Container();
    unitContainer.addChild(getUnitSprite(spriteSheets[unit.playerSlot], unit));

    //if own unit, moved, etc, has different behaviour

    unitContainer.eventMode = "static";
    if (unit.playerSlot == 0) { //TODO: own team's unit checker
      //check if waited or not
      //if ready, then start the create path procedure
    }
    else {
      let isNextAttack = false; //alternate between showing movement and attacking tiles
      unitContainer.on("pointerdown", async () => {
        let tilesShown: Container;
        if (isNextAttack) tilesShown = await showAttackableTiles(mapData, unit);
        else tilesShown = await showPassableTiles(mapData, unit);
        isNextAttack = !isNextAttack;
        mapContainer.addChild(tilesShown);
        onpointerup = () => {
          //make menu disappear when releasing click
          mapContainer.removeChild(tilesShown);
        };
      });
    }

    mapContainer.addChild(unitContainer);
  }

  mapContainer.x = 0;
  mapContainer.y = 0;
  return mapContainer;
}
