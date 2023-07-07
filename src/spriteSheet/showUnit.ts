import {
  AnimatedSprite,
  Container,
  Sprite,
  Spritesheet,
  Texture,
} from "pixi.js";
import { CreatableUnit } from "../server/schemas/unit";
import { Tile } from "../server/schemas/tile";
import {
  Coord,
  getAccessibleNodes,
  PathNode,
  showAttackableTiles,
  showPassableTiles,
  showPath,
  updatePath,
} from "./showPathing";
import { unitPropertiesMap } from "../shared/match-logic/buildable-unit";

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
    if (unit.playerSlot == 0) {
      //TODO: own team's unit checker
      //check if waited or not
      //if ready, then start the create path procedure
      unitContainer.on("pointerdown", async () => {

        //display path
        let path: PathNode[] = [];
        path.push({
          //original node
          pos: { x: unit.position[0], y: unit.position[1] },
          dist: 0,
          parent: null,
        });
        let currentPathDisplay = showPath(
          spriteSheets[spriteSheets.length - 1],
          path
        );

        const accessibleNodes = getAccessibleNodes(
          mapData,
          "clear", //!
          unitPropertiesMap[unit.type].moveRange,
          unitPropertiesMap[unit.type].movementType,
          unit.position[0],
          unit.position[1]
        );

        //so that the arrows don't cover the interactive tiles. maybe there's a better way to solve this issue
        const layeredContainer = new Container();
        const tileLayer = new Container();
        const pathLayer = new Container();
        const unitLayer = new Container();
        const interactiveLayer = new Container();
        layeredContainer.addChild(tileLayer);
        layeredContainer.addChild(pathLayer);
        layeredContainer.addChild(unitLayer);
        layeredContainer.addChild(interactiveLayer);
        mapContainer.addChild(layeredContainer);

        const tilesShown = await showPassableTiles(mapData, unit, accessibleNodes);
        tileLayer.addChild(tilesShown);
        unitLayer.addChild(getUnitSprite(spriteSheets[unit.playerSlot], unit)); //animation not synced with original sprite!

        const tilesInteract = new Container();
        for (const [pos, node] of accessibleNodes.entries()) {
          //Transparent squares, interactive, on top of everything
          const square = new Sprite(Texture.WHITE);
          square.anchor.set(0.5, 1); //?
          square.x = (pos.y + 1) * 16; //<- inverted for some reason
          square.y = (pos.x + 1) * 16;
          square.width = 16;
          square.height = 16;
          square.eventMode = "static";
          square.tint = "#000000";
          square.blendMode = 1; //blend mode Add

          //mouseupoutside <- ?
          square.on("pointerover", async () => {
            console.log(pos);
            path = updatePath(
              mapData,
              "clear",
              unitPropertiesMap[unit.type].moveRange,
              unitPropertiesMap[unit.type].movementType,
              accessibleNodes,
              path,
              pos
            );
            //update path display
            currentPathDisplay = showPath(
              spriteSheets[spriteSheets.length - 1],
              path
            );
            pathLayer.removeChildren();
            pathLayer.addChild(currentPathDisplay);
          });
          square.on("pointerup", async () => {
            //remove everything
            mapContainer.removeChild(layeredContainer);
          });
          tilesInteract.addChild(square);
        }
        interactiveLayer.addChild(tilesInteract);
      });

    } else {
      let isNextAttack = false; //alternate between showing movement and attacking tiles
      unitContainer.on("pointerdown", async () => {
        let tilesShown: Container;
        if (isNextAttack) tilesShown = await showAttackableTiles(mapData, unit);
        else tilesShown = await showPassableTiles(mapData, unit);
        isNextAttack = !isNextAttack;
        mapContainer.addChild(tilesShown);
        onpointerup = () => {
          //TODO i think this gets executed even if it's not "active"?
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
