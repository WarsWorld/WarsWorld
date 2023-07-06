import { AnimatedSprite, Container, Spritesheet } from "pixi.js";
import { CreatableUnit } from "../server/schemas/unit";
import { Tile } from "../server/schemas/tile";
import { showPassableTiles } from "./showPathing";

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
    console.log(spriteSheets.length);
    console.log(unit.playerSlot);
    console.log("amogus");
    unitContainer.addChild(getUnitSprite(spriteSheets[unit.playerSlot], unit));

    //if own unit, moved, etc, has different behaviour

    unitContainer.eventMode = "static";
    //Lets make menu appear
    unitContainer.on("pointerdown", async () => {
      console.log("touched a unit!");
      const passableTiles = await showPassableTiles(mapData, unit);
      mapContainer.addChild(passableTiles);
      //lets make menu dissapear on hover out
      //TODO: Make menu dissapear if we click somewhere else
      unitContainer.on("pointerleave", () => {
        console.log("unit pointerout");
        mapContainer.removeChild(passableTiles);
      });
    });

    mapContainer.addChild(unitContainer);
  }

  mapContainer.x = 0;
  mapContainer.y = 0;
  return mapContainer;
}
