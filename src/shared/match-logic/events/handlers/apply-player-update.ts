import type { EmittableAttackEvent } from "shared/types/events";
import type { MatchWrapper } from "shared/wrappers/match";

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
