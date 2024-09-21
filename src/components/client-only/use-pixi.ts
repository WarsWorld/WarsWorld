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
import { trpc } from "../../frontend/utils/trpc-client";
import { renderUnitSprite } from "../../pixi/renderUnitSprite";
import { applyBuildEvent } from "../../shared/match-logic/events/handlers/build";
import {
  PathNode,
} from "../../pixi/show-pathing";
import { handleClick } from "../../pixi/handleClick";
import { UnitWrapper } from "../../shared/wrappers/unit";
import { trpcActions } from "../../pixi/trpcActions";

export function usePixi(
  match: MatchWrapper<ChangeableTileWithSprite, FrontendUnit>,
  spriteSheets: LoadedSpriteSheet,
  player: PlayerInMatchWrapper,
) {
  const pixiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mapContainerRef = useRef<Container<DisplayObject> | null>(null);
  const unitContainerRef = useRef<Container<DisplayObject> | null>(null);
  const currentUnitRef = useRef<UnitWrapper | null>(null);
  const pathQueueRef = useRef<Map<Position, PathNode> | null >(null);


  //TODO: Someone please the ts gods
  const { actionMutation } = trpcActions(match, player, unitContainerRef.current, spriteSheets);

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
    mapContainerRef.current = mapContainer;
    unitContainerRef.current = unitContainer;
    mapContainerRef.current.eventMode = "static";

    //TODO: Someone please the ts gods
    const clickHandler = async (event: FederatedPointerEvent) => {
      handleClick(event, match, mapContainerRef.current, unitContainerRef.current, currentUnitRef, pathQueueRef, player, spriteSheets, actionMutation);
    };

    mapContainerRef.current.on("pointertap", clickHandler);

    return () => {
      app.stop();
      mapContainerRef.current.off("pointertap", clickHandler);
    };
  }, [match]);

  return {
    pixiCanvasRef,
    mapContainerRef,
  };
}