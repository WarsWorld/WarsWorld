import { WWEvent } from "types/core-game/events";
import { ServerMatchState } from "types/core-game/server-match-state";

export const applyEventToMatch = (match: ServerMatchState, event: WWEvent) => {
  const currentTurnPlayer = match.players.find((p) => p.hasCurrentTurn);

  switch (event.type) {
    case "build": {
    }
  }
};
