import { trpc } from "../frontend/utils/trpc-client";
import { applyBuildEvent } from "../shared/match-logic/events/handlers/build";
import type { MatchWrapper } from "shared/wrappers/match";
import type { PlayerInMatchWrapper } from "shared/wrappers/player-in-match";
import { applyMoveEvent } from "../shared/match-logic/events/handlers/move";
import type { Position } from "../shared/schemas/position";
import { applyAbilityEvent } from "../shared/match-logic/events/handlers/ability";
import { applyPassTurnEvent } from "../shared/match-logic/events/handlers/passTurn";
import type { ChangeableTileWithSprite } from "../frontend/components/match/types";
import type { FrontendUnit } from "../frontend/components/match/FrontendUnit";

export const trpcActions = (
  match: MatchWrapper<ChangeableTileWithSprite, FrontendUnit>,
  player: PlayerInMatchWrapper,
  onEventTrigger?: () => void, // Optional trigger function
) => {
  trpc.action.onEvent.useSubscription(
    {
      playerId: player.data.id,
      matchId: match.id,
    },
    {
      onData(event) {
        //todo: sometimes we receive events but frontend doesnt process them
        //so we can see the actionOnEvent but nothing happens (onData doesnt run...)
        //this logs proves useful to know if connection was done correctly
        //if the log doesnt run, then the frontend doesnt really process events
        console.log(event);
        switch (event.type) {
          case "build": {
            applyBuildEvent(match, event);

            break;
          }
          case "passTurn": {
            applyPassTurnEvent(match, event);
            break;
          }
          case "move": {
            if (event.path.length === 0 || !match.getUnit(event.path[0])) {
              break;
            }

            applyMoveEvent(match, event);

            const finalPosition: Position = event.path[event.path.length - 1];

            if (event.subEvent.type == "ability") {
              applyAbilityEvent(match, event.subEvent, finalPosition);
            }

            break;
          }
        }

        onEventTrigger?.();
      },
    },
  );

  const actionMutation = trpc.action.send.useMutation();
  return { actionMutation };
};
