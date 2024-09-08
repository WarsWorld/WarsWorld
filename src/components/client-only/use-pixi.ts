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
import showSubactionMenu from "../../pixi/show-subaction-menu";

export function usePixi(
  match: MatchWrapper<ChangeableTileWithSprite, FrontendUnit>,
  spriteSheets: LoadedSpriteSheet,
  player: PlayerInMatchWrapper,
) {
  const pixiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mapContainerRef = useRef<Container<DisplayObject> | null>(null);

  useEffect(() => {
    const app = new Application({
      view: pixiCanvasRef.current ?? undefined,
      autoDensity: true,
      resolution: window.devicePixelRatio,
      backgroundColor: "#000b2c",
      width: match.map.width * renderedTileSize + renderedTileSize,
      height: match.map.height * renderedTileSize + renderedTileSize,
    });

    const { mapContainer } = setupApp(app, match, renderMultiplier, spriteSheets);
    mapContainer.eventMode = "static";
    mapContainerRef.current = mapContainer;

    const clickHandler = (event: FederatedPointerEvent) => {
      // menus: event.page
      // determine tile: event.global or event.screen
      console.log(match.changeableTiles);
      console.log(/*event,*//* event.client, */event.global, /*event.page, event.screen*/);

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
        if (player.owns(unit) && unit.data.isReady) {
          // TODO do something, show move menu etc.
        }

        return;
      }

      const changeableTile = match.getTile(clickPosition);

      if (changeableTile !== undefined) {
        if (player.owns(changeableTile)) {
          console.log("this is a changeable tile");
          console.log(player);
          console.log(spriteSheets);
          showSubactionMenu(spriteSheets[player.data.army],match,clickPosition)
        }
      }

/*       const hover = document.createElement("div");
       hover.style.width = "4px";
       hover.style.height = "4px";
       hover.style.position = "absolute";
       hover.style.background = "red";
       hover.style.top = `${event.screen.y}px`;
       hover.style.left = `${event.screen.x}px`;
       document.body.appendChild(hover);*/
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
