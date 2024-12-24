"use client";
import { trpc } from "frontend/utils/trpc-client";
import type { LoadedSpriteSheet } from "pixi/load-spritesheet";
import { useEffect, useState } from "react";
import type { Position } from "shared/schemas/position";
import type { MatchWrapper } from "shared/wrappers/match";
import type { PlayerInMatchWrapper } from "shared/wrappers/player-in-match";
import type { FrontendUnit } from "../../frontend/components/match/FrontendUnit";
import type { ChangeableTileWithSprite } from "../../frontend/components/match/types";
import { usePixi } from "./use-pixi";
import { useSubscriptionWithRetry } from "./useSubscriptionWithRetry";
import { applyBuildEvent } from "../../shared/match-logic/events/handlers/build";
import { applyPassTurnEvent } from "../../shared/match-logic/events/handlers/passTurn";
import { applyMoveEvent } from "../../shared/match-logic/events/handlers/move";
import { applyAbilityEvent } from "../../shared/match-logic/events/handlers/ability";
import { applyAttackEvent } from "../../shared/match-logic/events/handlers/attack";

type Props = {
  match: MatchWrapper<ChangeableTileWithSprite, FrontendUnit>;
  player: PlayerInMatchWrapper;
  spriteSheets: LoadedSpriteSheet;
  turn: boolean;
  setTurn: any;
};

export const baseTileSize = 16;
export const renderMultiplier = 2;
export const renderedTileSize = baseTileSize * renderMultiplier;

export function MatchRenderer({ match, player, spriteSheets, turn, setTurn }: Props) {
  const [eventTrigger, setEventTrigger] = useState(0);
  useEffect(() => {
    setTurn(match.getCurrentTurnPlayer().data.id === player.data.id);
  }, []);

  const { pixiCanvasRef } = usePixi(match, spriteSheets, player);

  const passTurnMutation = trpc.action.send.useMutation();

  trpc.action.onEvent.useSubscription(
    {
      playerId: player.data.id,
      matchId: match.id,
    },
    {
      onData(event) {
        switch (event.type) {
          case "build": {
            applyBuildEvent(match, event);

            break;
          }
          case "passTurn": {
            applyPassTurnEvent(match, event);
            setTurn(match.getCurrentTurnPlayer().data.id === player.data.id);
            break;
          }
          case "move": {
            if (event.path.length === 0 || !match.getUnit(event.path[0])) {
              break;
            }

            applyMoveEvent(match, event);

            const finalPosition: Position = event.path[event.path.length - 1];

            switch (event.subEvent.type) {
              case "attack": {
                applyAttackEvent(match, event.subEvent, finalPosition);
                break;
              }
              case "ability": {
                applyAbilityEvent(match, event.subEvent, finalPosition);
                break;
              }
            }

            break;
          }
        }

        setEventTrigger(eventTrigger + 1);
      },
    },
  );

  return (
    <>
      <p>Your Funds: {player.data.funds}</p>
      <button
        className="btn"
        onClick={() => {
          passTurnMutation
            .mutateAsync({
              type: "passTurn",
              playerId: player.data.id,
              matchId: match.id,
            })
            .catch((err) => {
              console.log(err);
            });
        }}
      >
        {turn ? "Pass Turn" : "Not your Turn"}
      </button>
      <canvas
        className="@inline"
        style={{
          imageRendering: "pixelated",
        }}
        ref={pixiCanvasRef}
      ></canvas>
    </>
  );
}
