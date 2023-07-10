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
  getAccessibleNodes,
  getAttackableTiles,
  getTileSprite,
  PathNode,
  showAttackableTiles,
  showPassableTiles,
  showPath,
  updatePath,
} from "./showPathing";
import { unitPropertiesMap } from "../shared/match-logic/buildable-unit";
import { isSamePosition } from "../server/schemas/position";

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
): Container {
  const mapContainer = new Container();
  mapContainer.eventMode = "static";

  for (const unit of units) {
    const unitContainer = new Container();
    unitContainer.addChild(getUnitSprite(spriteSheets[unit.playerSlot], unit));
    unitContainer.eventMode = "static";

    if (unit.playerSlot == 0) {
      //TODO: own team's unit checker
      //check if waited or not
      //if ready, then start the create path procedure TODO: (supposing now that all are ready)
      unitContainer.on("pointerdown", async () => {
        const enemyUnits: CreatableUnit[] = [];
        for (const unit of units)
          if (unit.playerSlot != 0) enemyUnits.push(unit); //push if not same team

        //path display initialization
        let path: PathNode[] = [];
        path.push({
          //original node
          pos: [unit.position[0], unit.position[1]],
          dist: 0,
          parent: null,
        });
        let currentPathDisplay = showPath(
          spriteSheets[spriteSheets.length - 1],
          path
        );

        const accessibleNodes = getAccessibleNodes(
          mapData,
          enemyUnits,
          "clear", //!
          unitPropertiesMap[unit.type].moveRange,
          unitPropertiesMap[unit.type].movementType,
          unit.position[0],
          unit.position[1]
        );
        const attackableTiles = getAttackableTiles(
          mapData,
          enemyUnits,
          "clear", //!,
          unitPropertiesMap[unit.type].moveRange,
          unitPropertiesMap[unit.type].movementType,
          unit.position[0],
          unit.position[1],
          accessibleNodes
        );

        //put elements in "layers", in order
        //so that the arrows don't cover the interactive tiles. maybe there's a better way to solve this issue
        //TODO: probably can be done with a LOT less Containers xd
        const layeredContainer = new Container();
        const tileLayer = new Container();
        const pathLayer = new Container();
        const unitLayer = new Container();
        const outsideLayer = new Container();
        const interactiveLayer = new Container();
        layeredContainer.addChild(tileLayer);
        layeredContainer.addChild(pathLayer);
        layeredContainer.addChild(unitLayer);
        layeredContainer.addChild(outsideLayer);
        layeredContainer.addChild(interactiveLayer);
        mapContainer.addChild(layeredContainer);

        //create the visual passable tiles layer and the unit sprite layer
        const tilesShown = await showPassableTiles(
          mapData,
          unit,
          enemyUnits,
          accessibleNodes
        );
        tileLayer.addChild(tilesShown);

        unitLayer.addChild(getUnitSprite(spriteSheets[unit.playerSlot], unit)); //animation not synced with original sprite!

        const mapCover = new Sprite(Texture.WHITE);
        mapCover.x = 0.5 * 16; //<- probably better way. I'm trying to cover the map with that
        mapCover.y = 0;
        mapCover.width = mapData[0].length * 16;
        mapCover.height = mapData.length * 16;
        mapCover.eventMode = "static";
        mapCover.tint = "#000000";
        mapCover.blendMode = 1; //additive
        mapCover.on("pointerdown", async () => {
          console.log("clicked outside");
          mapContainer.removeChild(layeredContainer);
        });
        outsideLayer.addChild(mapCover);

        //create the interactive, transparent tiles layer
        const tilesInteract = new Container();
        for (const [pos, node] of accessibleNodes.entries()) {
          //Transparent squares, interactive, on top of everything
          const square = getTileSprite(pos, "#000000");
          square.blendMode = 1; //blend mode Add

          square.on("pointerover", async () => {
            path = updatePath(
              mapData,
              "clear",
              unitPropertiesMap[unit.type].moveRange,
              unitPropertiesMap[unit.type].movementType,
              accessibleNodes,
              path,
              pos
            );
            //update path display layer
            currentPathDisplay = showPath(
              spriteSheets[spriteSheets.length - 1],
              path
            );
            pathLayer.removeChildren();
            pathLayer.addChild(currentPathDisplay);
          });
          square.on("pointerdown", async () => {
            //This means a path has been selected (need to change "condition" for that), so remove everything
            console.log("path selected");
            mapContainer.removeChild(layeredContainer);
          });
          //add the interactive square to the interactive tiles container
          tilesInteract.addChild(square);
        }

        for (const enemyUnit of enemyUnits) {
          if (
            //probably can improve efficiency on that
            attackableTiles.some((t) => isSamePosition(t, enemyUnit.position))
          ) {
            //visible and interactive tile, cause nothing on top anyway
            const square = getTileSprite(enemyUnit.position, "#FF8080");
            square.blendMode = 2; //blend mode Multiply

            square.on("pointerover", async () => {
              //show dmg calc
            });
            square.on("pointerdown", async () => {
              //This means an attack has been commited (maybe require confirmation, like awbw?)
              console.log("unit attacked");
              mapContainer.removeChild(layeredContainer);
            });

            interactiveLayer.addChild(square);
          }
        }
        //add the interactive tiles container into the interactive tiles layer
        interactiveLayer.addChild(tilesInteract);
      });
    } else {
      //unit is NOT in "your" team
      let isNextAttack = false; //alternate between showing movement and attacking tiles
      unitContainer.on("pointerdown", async () => {
        const enemyUnits: CreatableUnit[] = [];
        for (const unit of units)
          if (unit.playerSlot === 0) enemyUnits.push(unit); //not true, need to get playerSlot and not equal
        let tilesShown: Container;
        if (isNextAttack)
          tilesShown = await showAttackableTiles(mapData, unit, enemyUnits);
        else tilesShown = await showPassableTiles(mapData, unit, enemyUnits);
        isNextAttack = !isNextAttack;
        mapContainer.addChild(tilesShown);
        onpointerup = () => {
          //TODO i think this gets executed even if it's not "active"? aka this next line is executed every time there's a pointerup
          //TODO  not only when there's already a container active with this code inside.
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
