import type { LoadedSpriteSheet } from "frontend/pixi/load-spritesheet";
import { trpc } from "frontend/utils/trpc-client";
import type { Container, DisplayObject, FederatedPointerEvent } from "pixi.js";
import { Application } from "pixi.js";
import { useEffect, useRef, useState } from "react";
import { applyBuildEvent } from "shared/match-logic/events/handlers/build";
import type { Position } from "shared/schemas/position";
import type { MatchWrapper } from "shared/wrappers/match";
import type { PlayerInMatchWrapper } from "shared/wrappers/player-in-match";
import { setupApp } from "../../pixi/setupApp";
import type { FrontendUnit } from "./FrontendUnit";
import type { ChangeableTileWithSprite } from "./types";

type Props = {
  match: MatchWrapper<ChangeableTileWithSprite, FrontendUnit>;
  player: PlayerInMatchWrapper;
  spriteSheets: LoadedSpriteSheet;
};

export const baseTileSize = 16;
const renderMultiplier = 2;
const renderedTileSize = baseTileSize * renderMultiplier;

export function MatchRenderer({ match, player, spriteSheets }: Props) {
  const pixiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mapContainerRef = useRef<Container<DisplayObject> | null>(null);
  const [buildMenuPosition, setBuildMenuPosition] = useState<Position | null>(null); // Position in viewport, not tiles.

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
      console.log(event, event.client, event.global, event.movement, event.page, event.screen);

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
          // show build menu
        }
      }

      // const hover = document.createElement("div");
      // hover.style.width = "4px";
      // hover.style.height = "4px";
      // hover.style.position = "absolute";
      // hover.style.background = "red";
      // hover.style.top = `${event.screen.y}px`;
      // hover.style.left = `${event.screen.x}px`;
      // document.body.appendChild(hover);
    };

    mapContainer.on("pointertap", clickHandler);

    return () => {
      app.stop();
      mapContainer.off("pointertap", clickHandler);
    };
  }, [match, spriteSheets, player]);

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
            break;
          }
          case "passTurn": {
            if (data.turns.at(-1)?.newWeather) {
              // const mapContainer = mapContainerRef.current
              // if (mapContainer === null) {
              //   return;
              // }
              // const oldTiles = mapContainer.children;
              // for (let y = 0; y < match.map.data.tiles.length; y++) {
              //   for (let x = 0; x < match.map.data.tiles[y].length; x++) {
              //     const tile = match.getTile([x, y]);
              //     const tileSprite = getTileSprite(match, tile, spriteSheets);
              //     // makes our sprites render at the bottom, not from the top.
              //     tileSprite.anchor.set(0, 1);
              //     tileSprite.x = x * baseTileSize;
              //     tileSprite.y = y * baseTileSize;
              //     tileSprite.zIndex = y;
              //     mapContainer.addChild(tileSprite);
              //     if ("sprite" in tile) {
              //       tile.sprite = tileSprite;
              //     }
              //   }
              // }
              // oldTiles.forEach(c => c.removeFromParent())
            }
          }
        }
      },
    },
  );

  return (
    <canvas
      className="@inline"
      style={{
        imageRendering: "pixelated",
      }}
      ref={pixiCanvasRef}
    ></canvas>
  );
}
