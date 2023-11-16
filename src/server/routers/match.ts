import { TRPCError } from "@trpc/server";
import { emitEvent } from "server/emitter/event-emitter";
import { matchStore } from "server/match-logic/match-store";
import { coSchema } from "server/schemas/co";
import type { MapWrapper } from "shared/wrappers/map";
import type { MatchWrapper } from "shared/wrappers/match";
import type { PlayersWrapper } from "shared/wrappers/players";
import { z } from "zod";
import { armySchema } from "../schemas/army";
import {
  matchBaseProcedure,
  playerBaseProcedure,
  playerInMatchBaseProcedure,
  publicBaseProcedure,
  router,
} from "../trpc/trpc-setup";
import { createMatchProcedure } from "./match/create";

const throwIfMatchNotInSetupState = (match: MatchWrapper) => {
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

const playersToFrontend = (players: PlayersWrapper) =>
  players.data.map((pimw) => pimw.data);

const matchStateToFrontend = (match: MatchWrapper) => ({
  id: match.id,
  map: mapToFrontend(match.map),
  players: playersToFrontend(match.players),
  state: match.status,
  turn: match.turn,
});

export const matchRouter = router({
  create: createMatchProcedure,
  // TODO: pagination
  getAll: publicBaseProcedure.query(() =>
    matchStore.getAll().map(matchStateToFrontend)
  ),
  getPlayerMatches: playerBaseProcedure.query(({ ctx }) =>
    matchStore
      .getMatchesOfPlayer(ctx.currentPlayer.id)
      .map(matchStateToFrontend)
  ),
  full: matchBaseProcedure.query(({ ctx: { match } }) => {
    // TODO: By default show no hidden units
    //       and FoW is completely dark and empty
    // TODO: If the user has a session and has a player in this match
    //       it needs to be checked and some information revealed accordingly
    return {
      id: match.id,
      changeableTiles: match.changeableTiles,
      currentWeather: match.currentWeather,
      map: match.map.data,
      players: playersToFrontend(match.players),
      rules: match.rules,
      status: match.status,
      turn: match.turn,
      units: match.units.data,
    };
  }),
  join: matchBaseProcedure
    .input(
      z.object({
        selectedCO: coSchema,
      })
    )
    .mutation(async ({ input, ctx: { currentPlayer, match } }) => {
      throwIfMatchNotInSetupState(match);

      if (match.players.hasById(currentPlayer.id)) {
        throw new Error("You've already joined this match!");
      }

      const nextAvailablePlayerSlot = match.getNextAvailableSlot();

      match.join(currentPlayer, nextAvailablePlayerSlot, input.selectedCO);

      emitEvent({
        type: "player-joined",
        matchId: match.id,
        player: currentPlayer,
        playerSlot: nextAvailablePlayerSlot,
      });
    }),
  leave: playerInMatchBaseProcedure.mutation(
    async ({ ctx: { match, currentPlayer } }) => {
      throwIfMatchNotInSetupState(match);

      match.players.leave(currentPlayer);

      emitEvent({
        matchId: match.id,
        type: "player-left",
        player: currentPlayer,
      });
    }
  ),
  setReady: playerInMatchBaseProcedure
    .input(
      z.object({
        readyState: z.boolean(),
      })
    )
    .mutation(
      async ({ input, ctx: { match, playerInMatch, currentPlayer } }) => {
        throwIfMatchNotInSetupState(match);

        playerInMatch.data.ready = input.readyState;

        emitEvent({
          type: "player-changed-ready-status",
          matchId: match.id,
          player: currentPlayer,
          ready: input.readyState,
        });

        if (match.allSlotsReady()) {
          match.status = "playing";
          // TODO notify participants, set timer etc.
        }
      }
    ),
  switchCO: playerInMatchBaseProcedure
    .input(
      z.object({
        selectedCO: coSchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      throwIfMatchNotInSetupState(ctx.match);

      ctx.playerInMatch.data.co = input.selectedCO;

      emitEvent({
        type: "player-picked-co",
        co: input.selectedCO,
        matchId: ctx.match.id,
        player: ctx.currentPlayer,
      });
    }),
  switchArmy: playerInMatchBaseProcedure
    .input(
      z.object({
        selectedArmy: armySchema,
      })
    )
    .mutation(async ({ input, ctx }) => {
      throwIfMatchNotInSetupState(ctx.match);

      ctx.playerInMatch.data.army = input.selectedArmy;

      emitEvent({
        type: "player-picked-army",
        army: input.selectedArmy,
        matchId: ctx.match.id,
        player: ctx.currentPlayer,
      });
    }),
});
