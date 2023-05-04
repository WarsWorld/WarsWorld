import { ServerMatchState } from "types/core-game/server-match-state";

export const getNextAvailablePlayerSlot = (matchState: ServerMatchState) => {
  let nextAvailablePlayerSlot: number | null = null;

  for (let i = 0; i < matchState.map.numberOfPlayers; i++) {
    const playerSlotIsOccupied = matchState.players.find(
      (e) => e.playerSlot === i,
    );

    if (!playerSlotIsOccupied) {
      nextAvailablePlayerSlot = i;
      break;
    }
  }

  if (nextAvailablePlayerSlot === null) {
    throw new Error("No player slots available (game full)");
  }

  return nextAvailablePlayerSlot;
};

export const getPlayerEntryInMatch = (
  match: ServerMatchState,
  playerId: string,
) => {
  return match.players.find((e) => e.playerId === playerId) ?? null;
};
