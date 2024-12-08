import { trpc } from "../frontend/utils/trpc-client";
import { applyBuildEvent } from "../shared/match-logic/events/handlers/build";
import { renderUnitSprite } from "./renderUnitSprite";
import type { MatchWrapper } from "shared/wrappers/match";
import type { LoadedSpriteSheet } from "pixi/load-spritesheet";
import type { PlayerInMatchWrapper } from "shared/wrappers/player-in-match";
import type { Container, DisplayObject } from "pixi.js";
import { Sprite } from "pixi.js";
import { applyMoveEvent } from "../shared/match-logic/events/handlers/move";
import type { Position } from "../shared/schemas/position";
import { applyAbilityEvent } from "../shared/match-logic/events/handlers/ability";
import { applyPassTurnEvent } from "../shared/match-logic/events/handlers/passTurn";
import type { ChangeableTileWithSprite } from "../frontend/components/match/types";
import type { FrontendUnit } from "../frontend/components/match/FrontendUnit";
import type { MutableRefObject } from "react";

export const trpcActions = (
  match: MatchWrapper<ChangeableTileWithSprite, FrontendUnit>,
  player: PlayerInMatchWrapper,
  unitContainer: MutableRefObject<Container<DisplayObject> | null>,
  mapContainer: MutableRefObject<Container<DisplayObject> | null>,
  spriteSheets: LoadedSpriteSheet,
) => {
  trpc.action.onEvent.useSubscription(
    {
      playerId: player.data.id,
      matchId: match.id,
    },
    {
      onData(event) {
        if (unitContainer.current === null || mapContainer.current === null) {
          throw new Error(
            `unitContainer is null = ${unitContainer.current === null} or mapContainer is null = ${
              mapContainer.current === null
            }`,
          );
        }

        switch (event.type) {
          case "build": {
            let unit = match.getUnit(event.position);

            if (!unit) {
              applyBuildEvent(match, event);

              unit = match.getUnitOrThrow(event.position);
              unitContainer.current.addChild(
                renderUnitSprite(unit, spriteSheets[match.getCurrentTurnPlayer().data.army]),
              );
            }

            break;
          }
          case "passTurn": {
            applyPassTurnEvent(match, event);

            unitContainer.current.children.forEach((child) => {
              if (child instanceof Sprite) {
                child.tint = "#ffffff";
              }
            });

            break;
          }
          case "move": {
            if (event.path.length === 0 || !match.getUnit(event.path[0])) {
              break;
            }

            applyMoveEvent(match, event);

            const finalPosition: Position = event.path[event.path.length - 1];
            const unit = match.getUnitOrThrow(finalPosition);

            if (event.subEvent.type == "ability") {
              applyAbilityEvent(match, event.subEvent, finalPosition);

              //TODO: Actually needs to check capture points and if 20 or more then run this
              if (unit.isInfantryOrMech()) {
                //mapContainer.current.addChild()
              }
            }

            unitContainer.current
              .getChildByName(`unit-${event.path[0][0]}-${event.path[0][1]}`)
              ?.destroy();

            unitContainer.current.addChild(
              renderUnitSprite(unit, spriteSheets[match.getCurrentTurnPlayer().data.army]),
            );
            break;
          }
        }
      },
    },
  );

  const actionMutation = trpc.action.send.useMutation();
  return { actionMutation };
};
