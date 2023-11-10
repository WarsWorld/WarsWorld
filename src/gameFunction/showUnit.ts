//TODO: Fix TS issues

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import {
  AnimatedSprite,
  Container,
  DisplayObject,
  Spritesheet,
  Texture,
} from "pixi.js";
import { WWUnit } from "../server/schemas/unit";
import { Tile } from "../server/schemas/tile";
import {
  getAccessibleNodes,
  getAttackableTiles,
  PathNode,
  showAttackableTiles,
  showPassableTiles,
  showPath,
  updatePath,
} from "./showPathing";
import { unitPropertiesMap } from "../shared/match-logic/buildable-unit";
import { isSamePosition } from "../server/schemas/position";
import {
  animatedSpriteConstructor,
  spriteConstructor,
  tileConstructor,
} from "./spriteConstructor";

// Creates the sprite of an unit
export function getUnitSprite(
  spriteSheet: Spritesheet,
  unit: WWUnit
): AnimatedSprite {
  return animatedSpriteConstructor(
    spriteSheet.animations[unit.type],
    0.07,
    (unit.position[1] + 1) * 16,
    (unit.position[0] + 1) * 16,
    16,
    16,
    "static",
    10
  );
}

export function showUnits(
  spriteSheets: Spritesheet[],
  mapData: Tile[][],
  units: WWUnit[]
): Container {
  const returnContainer = new Container();
  returnContainer.sortableChildren = true;
  returnContainer.eventMode = "static";
  //Check to see if same unit is clicked twice on the same spot
  let secondTimeClickingUnit = false;
  for (const unit of units) {
    const unitSprite = getUnitSprite(spriteSheets[unit.playerSlot], unit);
    returnContainer.addChild(unitSprite);
    unitSprite.zIndex = -1;

    if (unit.playerSlot == 0) {
      //TODO: own team's unit checker
      // check if waited or not
      // if ready, then start the create path procedure TODO: (supposing now that all are ready)
      unitSprite.on("pointerdown", async () => {
        //Is this the first time we are clicking this unit? if not,
        // then display the menu where they are
        // because it means we want to activate the unit where its sitting.
        if (secondTimeClickingUnit) {
          //TODO Run show menu function on current spot (don't have to do anything else )
          secondTimeClickingUnit = false;
          console.log("Displaying menu on same spot");
          const layerName = returnContainer.getChildByName(
            "arrowAndSquaresContainer"
          );
          if (layerName !== null) returnContainer.removeChild(layerName);
        }
        //First time clicking this unit, calculate the path and everything
        else {
          unitSprite.zIndex = 10;
          const enemyUnits: WWUnit[] = [];
          for (const unit of units) {
            if (unit.playerSlot != 0) enemyUnits.push(unit); //push if not same team}
          }

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

          //We clicked an unit, lets clean up other tiles/arrows/paths from previous unit clicked
          const layerName = returnContainer.getChildByName(
            "arrowAndSquaresContainer"
          );
          if (layerName !== null) returnContainer.removeChild(layerName);

          //the container holding arrow/path and other squareContainer and interactiveSqUAREScONTAINER
          const arrowAndSquaresContainer = new Container();
          arrowAndSquaresContainer.name = "arrowAndSquaresContainer";
          arrowAndSquaresContainer.sortableChildren = true;

          //The blue and red tiles we can see
          const squareContainer = new Container();
          arrowAndSquaresContainer.addChild(squareContainer);

          //Interactive squares that recalculate path and execute other functions
          const interactiveSquaresContainer = new Container();
          interactiveSquaresContainer.zIndex = 1;
          arrowAndSquaresContainer.addChild(interactiveSquaresContainer);

          //create the visual passable tiles layer and the unit sprite layer
          const tilesShown = await showPassableTiles(
            mapData,
            unit,
            enemyUnits,
            accessibleNodes
          );
          squareContainer.addChild(tilesShown);

          //create the interactive, transparent tiles layer
          for (const [pos] of accessibleNodes.entries()) {
            //Transparent squares, interactive, on top of everything
            const invisibleSquare = tileConstructor(pos, "#000000");
            invisibleSquare.alpha = 0;
            invisibleSquare.name = "invisibleSquare";
            invisibleSquare.on("pointerover", () => {
              console.log("im hovering over invisible square!");
              path = updatePath(
                mapData,
                "clear",
                unitPropertiesMap[unit.type].moveRange,
                unitPropertiesMap[unit.type].movementType,
                accessibleNodes,
                path,
                pos
              );
              //update path display layer also has the name arrows
              currentPathDisplay = showPath(
                spriteSheets[spriteSheets.length - 1],
                path
              );

              invisibleSquare.on("click", () => {
                //TODO: Through a function called showUnitMenu or something outside this file
                // Display unit menu (wait, capture, etc) and execute checks for menu items
                // such as if infantry and on non-owned city, show capture OR
                // if adjacent to enemy unit/can fire from position, show fire command in menu.

                //TODO: Check to make sure the coordinates selected don't have an ally unit, if they do,
                // show the path for that unit (since we can't move into other units).

                // TODO: Also remove the zIndex = 0, this is just for now since we dont display menus yet.
                unitSprite.zIndex = 0;
                console.log("path selected");
                secondTimeClickingUnit = false;
                returnContainer.removeChild(arrowAndSquaresContainer);
              });
              //lets cleanup previous arrows.
              const arrowName =
                arrowAndSquaresContainer.getChildByName("arrows");
              if (arrowName !== null)
                arrowAndSquaresContainer.removeChild(arrowName);

              arrowAndSquaresContainer.addChild(currentPathDisplay);
            });

            //add the interactive square to the interactive tiles container
            interactiveSquaresContainer.addChild(invisibleSquare);
          }

          //if we hover over the unit, delete all arrows (since there is no movement).
          unitSprite.on("pointerenter", () => {
            const arrowName = arrowAndSquaresContainer.getChildByName("arrows");
            if (arrowName !== null)
              arrowAndSquaresContainer.removeChild(arrowName);
          });

          //Lets create the red squares for enemy units!
          for (const enemyUnit of enemyUnits) {
            if (
              //probably can improve efficiency on that
              attackableTiles.some((t) => isSamePosition(t, enemyUnit.position))
            ) {
              const enemySquare = tileConstructor(
                enemyUnit.position,
                "#932f2f"
              );

              enemySquare.on("pointerover", async () => {
                //TODO: show dmg forecast/preview/%s checking current units and current terrains
              });
              enemySquare.on("pointerdown", async () => {
                unitSprite.zIndex = 0;
                //TODO This means an enemy unit has been clicked, if clicked again, initiate combat from "current" / "last" arrow/tile position.
                console.log("unit attacked");
                secondTimeClickingUnit = false;
                returnContainer.removeChild(arrowAndSquaresContainer);
              });

              squareContainer.addChild(enemySquare);
            }
          }

          //Invisible rectangle that serves as our eventListener that we are clicking outside the pathfinding so we need to remove the pathfinding
          const outsideOfPath = spriteConstructor(
            Texture.WHITE,
            0,
            0,
            mapData[0].length * 16,
            mapData.length * 16,
            "static"
          );
          outsideOfPath.alpha = 0;
          outsideOfPath.zIndex = -1;
          outsideOfPath.on("pointerdown", async () => {
            unitSprite.zIndex = 0;
            secondTimeClickingUnit = false;
            console.log("invisible rectangle clicked, eliminating layers");
            returnContainer.removeChild(arrowAndSquaresContainer);
          });
          arrowAndSquaresContainer.addChild(outsideOfPath);
          returnContainer.addChild(arrowAndSquaresContainer);
          secondTimeClickingUnit = true;
        }
      });
    }
    //unit is in the opposite team/is an enemy
    else {
      //TODO: Allow to "hold" enemy attack range ala Fire Emblem style so we can keep the "safe range" for our units from certain units
      // (like where is our Bcopter safe from two AA).
      let isNextAttack = false; //alternate between showing movement and attacking tiles
      unitSprite.on("pointerdown", async () => {
        const enemyUnits: WWUnit[] = [];
        for (const unit of units)
          if (unit.playerSlot === 0) enemyUnits.push(unit); //not true, need to get playerSlot and not equal
        let tilesShown: Container;
        if (isNextAttack) {
          tilesShown = await showAttackableTiles(mapData, unit, enemyUnits);
        } else {
          tilesShown = await showPassableTiles(mapData, unit, enemyUnits);
        }
        isNextAttack = !isNextAttack;
        tilesShown.zIndex = 10;
        returnContainer.addChild(tilesShown);

        onpointerup = () => {
          //TODO i think this gets executed even if it's not "active"? aka this next line is executed every time there's a pointerup
          //TODO  not only when there's already a container active with this code inside.

          //make menu disappear when releasing click
          returnContainer.removeChild(tilesShown);
        };
      });
    }
  }

  returnContainer.x = 0;
  returnContainer.y = 0;

  return returnContainer;
}
