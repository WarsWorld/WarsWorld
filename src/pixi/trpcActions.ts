import { trpc } from "../frontend/utils/trpc-client";
import { applyBuildEvent } from "../shared/match-logic/events/handlers/build";
import { renderUnitSprite } from "./renderUnitSprite";
import type { MatchWrapper } from "shared/wrappers/match";
import type { LoadedSpriteSheet } from "pixi/load-spritesheet";
import type { PlayerInMatchWrapper } from "shared/wrappers/player-in-match";
import type { Container } from "pixi.js";
import { Sprite } from "pixi.js";
import { applyMoveEvent } from "../shared/match-logic/events/handlers/move";
import type { Position } from "../shared/schemas/position";

export const trpcActions = (
  match: MatchWrapper,
  player: PlayerInMatchWrapper,
  unitContainer: Container,
  spriteSheets: LoadedSpriteSheet,
) => {
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

            if (unitContainer !== null) {
              unitContainer.addChild(
                renderUnitSprite(unit, spriteSheets[match.getCurrentTurnPlayer().data.army]),
              );
            }

            break;
          }
          case "passTurn": {
            if (unitContainer !== null) {
              unitContainer.children.forEach((child) => {
                if (child instanceof Sprite) {
                  child.tint = "#ffffff";
                }
              });
            }

            break;
          }
          case "move": {
            if (data.path.length === 0 || !match.getUnit(data.path[0])) {
              break;
            }

            console.log("move Event!");
            applyMoveEvent(match, data);
            console.log("event apploed!");
            const finalPosition: Position = data.path[data.path.length - 1];

            const unit = match.getUnitOrThrow(finalPosition);
            console.log("we did not throw from unit final pos!");
            unitContainer.getChildByName(`unit-${data.path[0][0]}-${data.path[0][1]}`)?.destroy();
            unitContainer.addChild(
              renderUnitSprite(unit, spriteSheets[match.getCurrentTurnPlayer().data.army]),
            );
            break;
          }
        }
      },
    },
  );

  return { actionMutation };
};
