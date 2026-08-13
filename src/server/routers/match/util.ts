import type { Match, WWMap } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type { MapWrapper } from "shared/wrappers/map";
import type { MatchWrapper } from "shared/wrappers/match";
import type { PlayerInMatch } from "shared/types/server-match-state";

export const throwIfMatchNotInSetupState = (match: MatchWrapper) => {
  if (match.status !== "setup") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "This action requires the match to be in 'setup' state, but it isn't",
    });
  }
};

const mapToFrontend = (map: MapWrapper) => ({
  id: map.data.id,
  name: map.data.name,
  numberOfPlayers: map.data.numberOfPlayers,
});

export const matchToFrontend = (match: MatchWrapper) => ({
  id: match.id,
  map: mapToFrontend(match.map),
  players: match.getAllPlayers().map((player) => player.data),
  state: match.status,
  turn: match.turn,
  // Authoritative now: finalizeIfGameOver flips status="finished" both on the deciding action and on
  // rebuild, so the outcome no longer needs re-deriving on every read.
  finished: match.status === "finished",
});

/**
 * Map a persisted DB row to the same shape as `matchToFrontend`. Used for finished matches, which are
 * archived out of the in-memory store (`match-store.rebuild` skips `finished`) and so must be read
 * straight from the DB. `turn` isn't persisted for archived matches — the history UI keys off the
 * result, not the day count.
 */
export const finishedRowToFrontend = (row: Match & { map: WWMap }) => ({
  id: row.id,
  map: { id: row.map.id, name: row.map.name, numberOfPlayers: row.map.numberOfPlayers },
  players: row.playerState as PlayerInMatch[],
  state: row.status,
  turn: 0,
  finished: true,
});

export function allMatchSlotsReady(match: MatchWrapper) {
  for (let i = 0; i < match.map.data.numberOfPlayers; i++) {
    if (match.getPlayerBySlot(i)?.data.ready !== true) {
      return false;
    }
  }

  return true;
}

export function getNextAvailableSlot(match: MatchWrapper) {
  for (let i = 0; i < match.map.data.numberOfPlayers; i++) {
    if (match.getPlayerBySlot(i) !== undefined) {
      return i;
    }
  }

  throw new Error("No player slots available (game full)");
}
