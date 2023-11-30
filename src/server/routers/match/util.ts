import { TRPCError } from "@trpc/server";
import type { MapWrapper } from "shared/wrappers/map";
import type { MatchWrapper } from "shared/wrappers/match";
import type { PlayerInMatchWrapper } from "shared/wrappers/player-in-match";

export const throwIfMatchNotInSetupState = (match: MatchWrapper) => {
  if (match.status !== "setup") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        "This action requires the match to be in 'setup' state, but it isn't"
    });
  }
};

const mapToFrontend = (map: MapWrapper) => ({
  id: map.data.id,
  name: map.data.name,
  numberOfPlayers: map.data.numberOfPlayers
});

export const matchToFrontend = (match: MatchWrapper) => ({
  id: match.id,
  map: mapToFrontend(match.map),
  players: match.getAllPlayers().map((player) => player.data),
  state: match.status,
  turn: match.turn
});

export function allMatchSlotsReady(match: MatchWrapper) {
  for (let i = 0; i < match.map.data.numberOfPlayers; i++) {
    if (match.getBySlot(i)?.data.ready !== true) {
      return false;
    }
  }

  return true;
}

export function getNextAvailableSlot(match: MatchWrapper) {
  for (let i = 0; i < match.map.data.numberOfPlayers; i++) {
    if (match.getBySlot(i) !== undefined) {
      return i;
    }
  }

  throw new Error("No player slots available (game full)");
}

function eliminatePlayer(player: PlayerInMatchWrapper) {
  player.data.eliminated = true;

  if (player.match.playerToRemoveWeatherEffect === player) {
    player.match.playerToRemoveWeatherEffect = player.getNextAlivePlayer();
  }
}
