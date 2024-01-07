// createMap.js
import type { ISpritesheetData, Spritesheet} from "pixi.js";
import { AnimatedSprite, Container, Sprite, Texture } from "pixi.js";
import showMenu from "../gameFunction/showMenu";
import { spriteConstructor } from "../gameFunction/spriteConstructor";
import type { Tile } from "../shared/schemas/tile";
import type { UseTRPCMutationResult } from "@trpc/react-query/shared";



export const mapRender = (
  spriteSheets:  Spritesheet<ISpritesheetData>[], 
  mapData: Tile[][],
  tileSize: number, 
  mapWidth: number,
  mapHeight: number,
  mutation:  UseTRPCMutationResult<never, never, never, never>, ) => {
  //the container that holds the map
  const mapContainer = new Container();
  mapContainer.x = tileSize;
  mapContainer.y = tileSize;

  //Lets render our map!
  let tile;

  for (let rowIndex = 0; rowIndex < mapData.length; rowIndex++) {
    const currentRow = mapData[rowIndex];

    for (let colIndex = 0; colIndex < currentRow.length; colIndex++) {
      const currentTile = currentRow[colIndex];
      const { type } = currentTile;

      //ITS A PROPERTY
      if ("playerSlot" in currentTile) {
        const slot = currentTile.playerSlot;

        //NEUTRAL
        if (slot === -1) {
          tile = new Sprite(spriteSheets[2].textures[type + "-0.png"]);
          //NOT NEUTRAL
        } else {
          tile = new AnimatedSprite(spriteSheets[slot].animations[type]);

          //if our building is able to produce units, it has a menu!
          if (type !== "hq" && type !== "lab" && type !== "city") {
            tile.eventMode = "static";
            //Lets make menu appear
            tile.on("pointerdown", () => {
              void (async () => {
                const menu = await showMenu(
                  spriteSheets[slot],
                  type,
                  slot,
                  rowIndex,
                  colIndex,
                  mapData.length - 1,
                  mapData[0].length - 1,
                  (input) => {
                    void mutation.mutateAsync(input);
                  }
                );

                //if there is a menu already out, lets remove it
                const menuContainer = mapContainer.getChildByName("menu");

                if (menuContainer !== null) {
                  mapContainer.removeChild(menuContainer);
                }

                //lets create a transparent screen that covers everything.
                // if we click on it, we will delete the menu
                // therefore, achieving a quick way to delete menu if we click out of it
                const emptyScreen = spriteConstructor(
                  Texture.WHITE,
                  0,
                  0,
                  mapWidth,
                  mapHeight,
                  "static",
                  -1
                );
                emptyScreen.alpha = 0;

                emptyScreen.on("pointerdown", () => {
                  mapContainer.removeChild(menu);
                  mapContainer.removeChild(emptyScreen);
                });

                mapContainer.addChild(menu);
                mapContainer.addChild(emptyScreen);
              })();
            });
          }

          //TODO: Seems like properties/buildings have different animation speeds...
          // gotta figure out how to make sure all buildings are animated properly
          // or at least AWBW seems to have different speeds/frames than Daemon's replayer
          tile.animationSpeed = 0.04;
          tile.play();
        }

        //NOT A PROPERTY
      } else if ("variant" in currentTile) {
        tile = new Sprite(
          spriteSheets[2].textures[
          currentTile.type + "-" + currentTile.variant + ".png"
            ]
        );
      } else {
        tile = new Sprite(
          spriteSheets[2].textures[currentTile.type + ".png"]
        );
      }

      //makes our sprites render at the bottom, not from the top.
      tile.anchor.set(1, 1);


      tile.x = (colIndex + 1) * tileSize;
      tile.y = (rowIndex + 1) * tileSize;
      mapContainer.addChild(tile);
    }
  }

  return mapContainer;

};