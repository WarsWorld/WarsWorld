import { ChatBox } from "frontend/components/ChatBox";
import { trpc } from "frontend/utils/trpc-client";
import type { LoadedSpriteSheet } from "pixi/load-spritesheet";
import { useState } from "react";
import { applyBuildEvent } from "shared/match-logic/events/handlers/build";
import type { Position } from "shared/schemas/position";
import type { ChatMessageFrontend } from "shared/types/chat-message";
import type { MatchWrapper } from "shared/wrappers/match";
import type { PlayerInMatchWrapper } from "shared/wrappers/player-in-match";
import type { FrontendUnit } from "../../frontend/components/match/FrontendUnit";
import type { ChangeableTileWithSprite } from "../../frontend/components/match/types";
import { usePixi } from "./use-pixi";

type Props = {
  match: MatchWrapper<ChangeableTileWithSprite, FrontendUnit>;
  player: PlayerInMatchWrapper;
  spriteSheets: LoadedSpriteSheet;
  chatMessages: ChatMessageFrontend[];
};

export const baseTileSize = 16;
export const renderMultiplier = 2;
export const renderedTileSize = baseTileSize * renderMultiplier;

export function MatchRenderer({ match, player, spriteSheets, chatMessages }: Props) {
  const [buildMenuPosition, setBuildMenuPosition] = useState<Position | null>(null); // Position in viewport, not tiles.
  const [chatHistory, setChatHistory] = useState(chatMessages);

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

            break;
          }
          case "chatMessage": {
            setChatHistory((prev) => [...prev, data]);
            break;
          }
        }
      },
    },
  );

  return (
    <>
      <canvas
        className="@inline"
        style={{
          imageRendering: "pixelated",
        }}
        ref={pixiCanvasRef}
      ></canvas>
      <ChatBox matchId={match.id} currentPlayerId={player.data.id} chatHistory={chatHistory} />
    </>
  );
}
