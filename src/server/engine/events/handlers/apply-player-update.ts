import type { EmittableAttackEvent } from "server/engine/types/events";
import type { MatchWrapper } from "server/engine/entities/match";

export const applyPlayerUpdate = (
  match: MatchWrapper,
  playerUpdate: EmittableAttackEvent["playerUpdate"],
) => {
  for (const playerInUpdate of playerUpdate) {
    const playerInMatch = match.getPlayerById(playerInUpdate.id);

    if (playerInMatch === undefined) {
      throw new Error(
        `Could not apply the playerUpdate: player ${playerInUpdate.id} not found in local match state`,
      );
    }

    playerInMatch.data = playerInUpdate;
  }
};
