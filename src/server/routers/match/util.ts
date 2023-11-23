import type { Player } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import type { CO } from "shared/schemas/co";
import type { MapWrapper } from "shared/wrappers/map";
import type { MatchWrapper } from "shared/wrappers/match";
import { PlayerInMatchWrapper } from "shared/wrappers/player-in-match";
import type { PlayersWrapper } from "shared/wrappers/players";

export const throwIfMatchNotInSetupState = (match: MatchWrapper) => {
  if (match.status !== "setup") {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        "This action requires the match to be in 'setup' state, but it isn't",
    });
  }
};

const mapToFrontend = (map: MapWrapper) => ({
  id: map.data.id,
  name: map.data.name,
  numberOfPlayers: map.data.numberOfPlayers,
});

export const playersToFrontend = (players: PlayersWrapper) =>
  players.data.map((pimw) => pimw.data);

export const matchToFrontend = (match: MatchWrapper) => ({
  id: match.id,
  map: mapToFrontend(match.map),
  players: playersToFrontend(match.players),
  state: match.status,
  turn: match.turn,
});

export function allMatchSlotsReady(match: MatchWrapper) {
  for (let i = 0; i < match.map.data.numberOfPlayers; i++) {
    if (match.players.getBySlot(i)?.data.ready !== true) {
      return false;
    }
  }

  return true;
}

export function getNextAvailableSlot(match: MatchWrapper) {
  for (let i = 0; i < match.map.data.numberOfPlayers; i++) {
    if (match.players.getBySlot(i) !== undefined) {
      return i;
    }
  }

  throw new Error("No player slots available (game full)");
}

export function joinMatchAndGetPlayer(
  player: Player,
  match: MatchWrapper,
  co: CO
) {
  const slot = getNextAvailableSlot(match);

  match.players.data.push(
    new PlayerInMatchWrapper(
      {
        id: player.id,
        slot,
        ready: false,
        co,
        funds: 0,
        timesPowerUsed: 0,
        powerMeter: 0,
        army: "orange-star",
        COPowerState: "no-power",
      },
      match
    )
  );
}

function eliminatePlayer(player: PlayerInMatchWrapper) {
  player.data.eliminated = true;

  if (player.match.playerToRemoveWeatherEffect === player) {
    player.match.playerToRemoveWeatherEffect = player.getNextAlivePlayer();
  }
}
