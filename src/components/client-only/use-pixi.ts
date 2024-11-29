import type { Container, DisplayObject, FederatedPointerEvent } from "pixi.js";
import { Sprite } from "pixi.js";
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
import type { PathNode } from "../../pixi/show-pathing";
import { handleClick } from "../../pixi/handleClick";
import type { UnitWrapper } from "../../shared/wrappers/unit";
import { trpcActions } from "../../pixi/trpcActions";

export function usePixi(
  match: MatchWrapper<ChangeableTileWithSprite, FrontendUnit>,
  spriteSheets: LoadedSpriteSheet,
  player: PlayerInMatchWrapper,
) {
  //containers holding pixi elements
  const pixiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mapContainerRef = useRef<Container<DisplayObject> | null>(null);
  const unitContainerRef = useRef<Container<DisplayObject> | null>(null);

  // the unit we've clicked (the one that will be seeing sub action menu), we keep it here to reference it later on
  const currentUnitClickedRef = useRef<UnitWrapper | null>(null);

  // when user clicks an unit, we need a variable to determine if we show them unit's movement range, attack range or vision (for fog)
  const unitRangeShowRef = useRef<"attack" | "movement" | "vision">("movement");

  const thirdClickRef = useRef<boolean>(false);

  const pathQueueRef = useRef<Map<Position, PathNode> | null>(null);

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
    //This function handles almost all the clicks, sometimes elements (such as menus) have event listeners, otherwise it is handled via this function
    const clickHandler = async (event: FederatedPointerEvent) => {
      await handleClick(
        event,
        match,
        mapContainerRef.current,
        unitContainerRef.current,
        currentUnitClickedRef,
        pathQueueRef,
        player,
        spriteSheets,
        actionMutation,
        unitRangeShowRef,
        thirdClickRef,
      );
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
