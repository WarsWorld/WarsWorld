"use client";
import type { Container, DisplayObject } from "pixi.js";
import { Application } from "pixi.js";
import type { LoadedSpriteSheet } from "pixi/load-spritesheet";
import { setupApp } from "pixi/setupApp";
import { useEffect, useRef } from "react";
import type { MainAction } from "shared/schemas/action";
import type { Position } from "shared/schemas/position";
import type { MatchWrapper } from "shared/wrappers/match";
import type { PlayerInMatchWrapper } from "shared/wrappers/player-in-match";
import type { FrontendUnit } from "../../frontend/components/match/FrontendUnit";
import type { ChangeableTileWithSprite } from "../../frontend/components/match/types";
import { handleClick, handleHover } from "../../pixi/handleClick";
import type { PathNode } from "../../pixi/show-pathing";
import { trpcActions } from "../../pixi/trpcActions";
import type { UnitWrapper } from "../../shared/wrappers/unit";
import { renderMultiplier, renderedTileSize } from "./MatchRenderer";

export const usePixi = (
  match: MatchWrapper<ChangeableTileWithSprite, FrontendUnit>,
  spriteSheets: LoadedSpriteSheet,
  player: PlayerInMatchWrapper,
) => {
  //containers holding pixi elements
  const pixiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mapContainerRef = useRef<Container<DisplayObject> | null>(null);
  const unitContainerRef = useRef<Container<DisplayObject> | null>(null);
  const interactiveContainerRef = useRef<Container<DisplayObject> | null>(null);

  // the unit we've clicked (the one that will be seeing sub action menu), we keep it here to reference it later on
  const currentUnitClickedRef = useRef<UnitWrapper | null>(null);

  // when user clicks an unit, we need a variable to determine if we show them unit's movement range, attack range or vision (for fog)
  const unitRangeShowRef = useRef<"attack" | "movement" | "vision">("movement");

  //TODO: To some extent, these three all store the same type of information (positions), however, they store it at different times...
  const moveTilesRef = useRef<Map<Position, PathNode> | null>(null);

  const pathRef = useRef<Position[] | null>(null);

  const { actionMutation } = trpcActions();

  const sendAction = async (action: MainAction) => {
    await actionMutation.mutateAsync({
      playerId: player.data.id,
      matchId: match.id,
      ...action,
    });
  };

  useEffect(() => {
    const app = new Application({
      view: pixiCanvasRef.current ?? undefined,
      autoDensity: true,
      resolution: window.devicePixelRatio,
      backgroundColor: "#000b2c",
      width: match.map.width * renderedTileSize + renderedTileSize,
      height: match.map.height * renderedTileSize + renderedTileSize,
    });

    const onTileClick = async (pos: Position) => {
      if (
        mapContainerRef.current !== null &&
        unitContainerRef.current !== null &&
        interactiveContainerRef.current !== null
      ) {
        await handleClick(
          pos,
          match,
          player,
          mapContainerRef.current,
          unitContainerRef.current,
          interactiveContainerRef.current,
          currentUnitClickedRef,
          moveTilesRef,
          unitRangeShowRef,
          pathRef,
          spriteSheets,
          sendAction,
        );
      }
    };

    const onTileHover = async (pos: Position) => {
      if (
        mapContainerRef.current !== null &&
        unitContainerRef.current !== null &&
        interactiveContainerRef.current !== null
      ) {
        await handleHover(
          pos,
          match,
          player,
          mapContainerRef.current,
          unitContainerRef.current,
          interactiveContainerRef.current,
          currentUnitClickedRef,
          moveTilesRef,
          unitRangeShowRef,
          pathRef,
          spriteSheets,
          sendAction,
        );
      }
    };

    const { mapContainer, unitContainer, interactiveContainer } = setupApp(
      app,
      match,
      renderMultiplier,
      spriteSheets,
      onTileClick,
      onTileHover,
    );
    mapContainerRef.current = mapContainer;
    unitContainerRef.current = unitContainer;
    interactiveContainerRef.current = interactiveContainer;
    mapContainerRef.current.eventMode = "static";

    return () => {
      app.stop();

      for (const tile of interactiveContainer.children) {
        tile.off("pointertap");
        tile.off("pointerenter");
      }
    };
  }, [actionMutation, match, player, spriteSheets, sendAction]);

  return {
    pixiCanvasRef,
    mapContainerRef,
  };
};
