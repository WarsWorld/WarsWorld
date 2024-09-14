import { trpc } from "frontend/utils/trpc-client";
import type { LoadedSpriteSheet } from "pixi/load-spritesheet";
import { useState } from "react";
import { applyBuildEvent } from "shared/match-logic/events/handlers/build";
import type { Position } from "shared/schemas/position";
import type { MatchWrapper } from "shared/wrappers/match";
import type { PlayerInMatchWrapper } from "shared/wrappers/player-in-match";
import type { FrontendUnit } from "../../frontend/components/match/FrontendUnit";
import type { ChangeableTileWithSprite } from "../../frontend/components/match/types";
import { usePixi } from "./use-pixi";

type Props = {
  match: MatchWrapper<ChangeableTileWithSprite, FrontendUnit>;
  player: PlayerInMatchWrapper;
  spriteSheets: LoadedSpriteSheet;
};

export const baseTileSize = 16;
export const renderMultiplier = 2;
export const renderedTileSize = baseTileSize * renderMultiplier;

export function MatchRenderer({ match, player, spriteSheets }: Props) {
  const [buildMenuPosition, setBuildMenuPosition] = useState<Position | null>(null); // Position in viewport, not tiles.

  const { mapContainerRef, pixiCanvasRef } = usePixi(match, spriteSheets, player);

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
