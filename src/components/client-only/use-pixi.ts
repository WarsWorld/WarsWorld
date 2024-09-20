import { Container, DisplayObject, FederatedPointerEvent, Sprite } from "pixi.js";
import { Application } from "pixi.js";
import type { LoadedSpriteSheet } from "pixi/load-spritesheet";
import { setupApp } from "pixi/setupApp";
import { useEffect, useRef } from "react";
import type { Position } from "shared/schemas/position";
import type { MatchWrapper } from "shared/wrappers/match";
import type { PlayerInMatchWrapper } from "shared/wrappers/player-in-match";
import type { FrontendUnit } from "../../frontend/components/match/FrontendUnit";
import type { ChangeableTileWithSprite } from "../../frontend/components/match/types";
import { renderMultiplier, renderedTileSize } from "./MatchRenderer";
import buildUnitMenu from "../../pixi/buildUnitMenu";
import { trpc } from "../../frontend/utils/trpc-client";
import { renderUnitSprite } from "../../pixi/renderUnitSprite";
import { applyBuildEvent } from "../../shared/match-logic/events/handlers/build";
import {
  getAccessibleNodes,
  getShortestPathToPosition,
  PathNode,
  showPassableTiles,
  showPath
} from "../../pixi/show-pathing";
import subActionMenu from "../../pixi/subActionMenu";

export function usePixi(
  match: MatchWrapper<ChangeableTileWithSprite, FrontendUnit>,
  spriteSheets: LoadedSpriteSheet,
  player: PlayerInMatchWrapper,
) {
  const pixiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mapContainerRef = useRef<Container<DisplayObject> | null>(null);
  const unitContainerRef = useRef<Container<DisplayObject> | null>(null);
  const currentUnitRef = useRef<FrontendUnit | null>(null);


  //TODO: trpc mutations need to be in this file I believe, could it be possible to import them from elsewhere? It will become messy having each action here...
  const actionMutation = trpc.action.send.useMutation();

  trpc.action.onEvent.useSubscription(
    {
      playerId: player.data.id,
      matchId: match.id,
    },
    {
      onData(data) {
        switch (data.type) {
          case "build": {
            applyBuildEvent(match, data);
            const unit = match.getUnitOrThrow(data.position);
            if (unitContainerRef.current !== null) {
                unitContainerRef.current.addChild(renderUnitSprite(unit,spriteSheets[match.getCurrentTurnPlayer().data.army]))
            }
            break;
          }
          case "passTurn": {
            if (unitContainerRef.current !== null) {
              unitContainerRef.current.children.forEach((child) => {
                if (child instanceof Sprite) {
                  child.tint = "#ffffff"
                }
              })
            }

          }

        }
      },
    },
  );

  useEffect(() => {
    const app = new Application({
      view: pixiCanvasRef.current ?? undefined,
      autoDensity: true,
      resolution: window.devicePixelRatio,
      backgroundColor: "#000b2c",
      width: match.map.width * renderedTileSize + renderedTileSize,
      height: match.map.height * renderedTileSize + renderedTileSize,
    });

    const { mapContainer, unitContainer } = setupApp(app, match, renderMultiplier, spriteSheets);
    mapContainer.eventMode = "static";
    mapContainerRef.current = mapContainer;
    unitContainerRef.current = unitContainer;

    //TODO: Should this be a ref?
    let pathQueue: Map<Position, PathNode> | null = null;


    const clickHandler = async (event: FederatedPointerEvent) => {

      if (match.getCurrentTurnPlayer().data.id !== player.data.id) {
        return;
      }
      //removes the menu if we click anywhere, still lets the menu work
        unitContainer.getChildByName("unitMenu")?.destroy();
      unitContainer.getChildByName("subMenu")?.destroy();
        unitContainer.getChildByName("unit-ghost")?.destroy();



      const x = Math.floor((event.global.x - renderedTileSize / 2) / renderedTileSize);
      const y = Math.floor((event.global.y - renderedTileSize / 2) / renderedTileSize);

      const clickPosition: Position = [x, y];

      // UNIT MOVING HANDLING
      let path = mapContainer.getChildByName("path");
      //Handle clicking on path
      if ( pathQueue && currentUnitRef.current) {
        let clickedOnPath = false;
        for (const [pos] of pathQueue) {
          if (clickPosition[0] === pos[0] && clickPosition[1] === pos[1]) {

            console.log(pathQueue);
            clickedOnPath = true;
            console.log("you've clicked on a path!");
            console.log(pos);

            // 1 - dissapear current sprite
            unitContainer.getChildByName(`unit-${currentUnitRef.current.data.position[0]}-${currentUnitRef.current.data.position[1]}`)?.destroy()

            //2 - create new sprite in position
            unitContainer.addChild(renderUnitSprite(currentUnitRef.current,spriteSheets[match.getCurrentTurnPlayer().data.army], clickPosition))

            const newPath = getShortestPathToPosition(match,currentUnitRef.current,pos)
            if (newPath === null) break;
            console.log("new path");
            console.log(newPath);

            //4 - display subactio menu next to unit in new position
            const subMenu = await subActionMenu(match, player, currentUnitRef.current,pos, actionMutation, newPath)
            unitContainer.addChild(subMenu)

          }
        }
        //handle if we didnt click on the path
        if (!clickedOnPath) {
          if (path) mapContainer.removeChild(path);


          //lets add the original unit back to its original position only if the original doesnt exist
          if (!unitContainer.getChildByName(`unit-${currentUnitRef.current.data.position[0]}-${currentUnitRef.current.data.position[1]}`)) {
            unitContainer.addChild(renderUnitSprite(currentUnitRef.current, spriteSheets[match.getCurrentTurnPlayer().data.army]));
          }


          pathQueue = null;
          currentUnitRef.current = null;
        }
      }


      const unit = match.getUnit(clickPosition);
      if (unit !== undefined) {
        //todo: ts hates this,
        //@ts-ignore
        if (player.owns(unit.data) && unit.data.isReady) {
          currentUnitRef.current = unit;
          const showPath = showPassableTiles(match,unit);
          pathQueue = getAccessibleNodes(match,unit)
          if (path) mapContainer.removeChild(path)
          mapContainer.addChild(showPath);

        }

        return;
      }

      const changeableTile = match.getTile(clickPosition);

      if (changeableTile !== undefined) {
        //TODO: How to manage silo/show different menu
        if (player.owns(changeableTile)) {
          //this assumes the tile is a building and not a silo
          let unitMenu = await buildUnitMenu(spriteSheets[player.data.army], match,player, clickPosition, actionMutation )

          //The menu is added to the unitContainer because units are ALWAYS above terrain (so unitContainer.zIndex > mapContainer.zIndex, and we need the menu to be ALWAYS above units so it has to be in the unitContainer
          unitContainer.addChild(unitMenu)

       }
      }
    };

    mapContainer.on("pointertap", clickHandler);

    return () => {
      app.stop();
      mapContainer.off("pointertap", clickHandler);
    };
  }, [match, spriteSheets, player]);

  return {
    pixiCanvasRef,
    mapContainerRef,
  };
}


//unsure if function will ever need this red pointer again

/*       const hover = document.createElement("div");
             hover.style.width = "4px";
             hover.style.height = "4px";
             hover.style.position = "absolute";
             hover.style.background = "red";
             hover.style.top = `${event.screen.y}px`;
             hover.style.left = `${event.screen.x}px`;
             document.body.appendChild(hover);*/