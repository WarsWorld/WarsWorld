import { trpc } from "../frontend/utils/trpc-client";
import { applyBuildEvent } from "../shared/match-logic/events/handlers/build";
import { renderUnitSprite } from "./renderUnitSprite";
import type { MatchWrapper } from "shared/wrappers/match";
import type { LoadedSpriteSheet } from "pixi/load-spritesheet";
import type { PlayerInMatchWrapper } from "shared/wrappers/player-in-match";
import { Container, Sprite } from "pixi.js";
import { applyMoveEvent } from "../shared/match-logic/events/handlers/move";
import { Position } from "../shared/schemas/position";

export const trpcActions = (
  match: MatchWrapper,
  player: PlayerInMatchWrapper,
  unitContainer: Container,
  spriteSheets: LoadedSpriteSheet
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
                renderUnitSprite(unit, spriteSheets[match.getCurrentTurnPlayer().data.army])
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
     /*     case "move": {
            if (data.path.length === 0) break;
            console.log("move event!");
            applyMoveEvent(match, data);
            console.log(data);
            let finalPosition : Position= data.path[0]
            const unit = match.getUnitOrThrow(finalPosition);
            console.log("we passed the unit test");

            if (unit !== null) {
              unitContainer.getChildByName(`unit-${finalPosition[0]}-${finalPosition[1]}`)?.destroy();
              unitContainer.addChild(
                renderUnitSprite(unit, spriteSheets[match.getCurrentTurnPlayer().data.army])
              );
            }
            console.log("finished moving");
            break;
          }*/
        }
      },
    }
  );

  return { actionMutation };
};
