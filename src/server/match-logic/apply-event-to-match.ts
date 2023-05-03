import { WWEvent } from "types/core-game/events";
import { MatchState } from "./server-match-states";

export const applyEventToMatch = (match: MatchState, event: WWEvent) => {
  const currentTurnPlayer = match.players.find((p) => p.hasCurrentTurn);

  switch (event.type) {
    case "build": {
    }
  }
};
