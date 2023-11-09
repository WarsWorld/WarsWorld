import {
  BackendMatchState,
  PlayerInMatch,
} from "shared/types/server-match-state";

export const getPlayerBySlot = (
  matchState: BackendMatchState,
  playerSlot: number
): PlayerInMatch => {
  const player = matchState.players.find((p) => p.slot === playerSlot);

  if (player === undefined) {
    throw new Error(`Could not get player with slot ${playerSlot}`);
  }

  return player;
};
