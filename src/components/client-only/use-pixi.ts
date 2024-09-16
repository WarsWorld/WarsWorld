import type { Container, DisplayObject, FederatedPointerEvent } from "pixi.js";
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
import { showPassableTiles } from "../../pixi/show-pathing";

export function usePixi(
  match: MatchWrapper<ChangeableTileWithSprite, FrontendUnit>,
  spriteSheets: LoadedSpriteSheet,
  player: PlayerInMatchWrapper,
) {
  const pixiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mapContainerRef = useRef<Container<DisplayObject> | null>(null);
  const unitContainerRef = useRef<Container<DisplayObject> | null>(null);


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



    const clickHandler = async (event: FederatedPointerEvent) => {

      //removes the menu if we click anywhere, still lets the menu work
      const unitMenu = unitContainer.getChildByName("unitMenu")
      if (unitMenu !== null) {
        unitContainer.removeChild(unitMenu);
      }

      // menus: event.page
      // determine tile: event.global or event.screen
      //console.log(/*event,*//* event.client, */event.global, /*event.page, event.screen*/);

      const x = Math.floor((event.global.x - renderedTileSize / 2) / renderedTileSize);
      const y = Math.floor((event.global.y - renderedTileSize / 2) / renderedTileSize);

      const clickPosition: Position = [x, y];

      // only handle admin features like unwaiting units up to here, everything else requires
      // the player to have the current turn.

      if (match.getCurrentTurnPlayer().data.id !== player.data.id) {
        return;
      }

      const unit = match.getUnit(clickPosition);
      if (unit !== undefined) {
        //todo: ts hates this,
        //@ts-ignore
        if (player.owns(unit.data)/* && unit.data.isReady*/) {
          const showPath = showPassableTiles(match,unit);
          mapContainer.addChild(showPath);

        }

        return;
      }

      const changeableTile = match.getTile(clickPosition);

      if (changeableTile !== undefined) {
        //TODO: How to manage silo/show different menu
        if (player.owns(changeableTile)) {
          //this assumes the tile is a building and not a silo
          let unitMenu = await buildUnitMenu(spriteSheets[player.data.army], match, clickPosition, actionMutation )

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