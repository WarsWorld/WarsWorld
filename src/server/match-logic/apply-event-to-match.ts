import { WWEvent } from "shared/types/events";
import { BackendMatchState } from "shared/types/server-match-state";

export const applyEventToMatch = (match: BackendMatchState, event: WWEvent) => {
  const currentTurnPlayer = match.players.find((p) => p.hasCurrentTurn);

  switch (event.type) {
    case "build": {
    }
  }
};
