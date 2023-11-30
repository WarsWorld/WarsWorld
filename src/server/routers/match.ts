import { emit } from "server/emitter/event-emitter";
import { matchStore } from "server/match-store";
import { pageMatchIndex } from "server/page-match-index";
import { playerMatchIndex } from "server/player-match-index";
import { prisma } from "server/prisma/prisma-client";
import { createMatchStartEvent } from "shared/match-logic/events/handlers/match-start";
import { armySchema } from "shared/schemas/army";
import { coIdSchema } from "shared/schemas/co";
import { z } from "zod";
import {
  matchBaseProcedure,
  playerBaseProcedure,
  playerInMatchBaseProcedure,
  publicBaseProcedure,
  router
} from "../trpc/trpc-setup";
import { createMatchProcedure } from "./match/create";
import {
  allMatchSlotsReady,
  joinMatchAndGetPlayer,
  matchToFrontend,
  playersToFrontend,
  throwIfMatchNotInSetupState
} from "./match/util";

export const matchRouter = router({
  create: createMatchProcedure,
  getAll: publicBaseProcedure
    .input(z.object({ pageNumber: z.number().int().nonnegative() }))
    .query(({ input: { pageNumber } }) =>
      pageMatchIndex.getPage(pageNumber).map(matchToFrontend)
    ),
  getPlayerMatches: playerBaseProcedure.query(
    ({ ctx: { currentPlayer } }) =>
      playerMatchIndex
        .getPlayerMatches(currentPlayer.id)
        ?.map(matchToFrontend) ?? []
  ),
  full: matchBaseProcedure.query(({ ctx: { match, currentPlayer } }) => ({
    id: match.id,
    leagueType: match.leagueType,
    changeableTiles: match.changeableTiles,
    currentWeather: match.currentWeather,
    map: match.map.data,
    players: playersToFrontend(match.players),
    rules: match.rules,
    status: match.status,
    turn: match.turn,
    units:
      match.players.getById(currentPlayer.id)?.getEnemyUnitsInVision() ?? [] // TODO and also the player/teams units LOL
  })),
  join: matchBaseProcedure
    .input(
      z.object({
        selectedCO: coIdSchema
      })
    )
    .mutation(({ input, ctx: { currentPlayer, match } }) => {
      throwIfMatchNotInSetupState(match);

      if (match.players.getById(currentPlayer.id) !== undefined) {
        throw new Error("You've already joined this match!");
      }

      // TODO check if selectedCO is allowed for tier/league/match-blacklist
      joinMatchAndGetPlayer(currentPlayer, match, input.selectedCO);

      const player = match.players.getByIdOrThrow(currentPlayer.id);

      playerMatchIndex.onPlayerJoin(player, match);

      emit({
        type: "player-joined",
        matchId: match.id,
        playerId: currentPlayer.id
      });
    }),
  leave: playerInMatchBaseProcedure.mutation(
    ({ ctx: { match, playerInMatch } }) => {
      throwIfMatchNotInSetupState(match);

      match.players.data = match.players.data.filter(
        (p) => p.data.id !== playerInMatch.data.id
      );

      playerMatchIndex.onPlayerLeave(
        match.players.getByIdOrThrow(playerInMatch.data.id),
        match
      );

      if (match.players.data.length === 0) {
        pageMatchIndex.removeMatch(match);
        matchStore.removeMatchFromIndex(match);
        return;
      }

      emit({
        matchId: match.id,
        type: "player-left",
        playerId: playerInMatch.data.id
      });
    }
  ),
  setReady: playerInMatchBaseProcedure
    .input(
      z.object({
        readyState: z.boolean()
      })
    )
    .mutation(
      async ({ input, ctx: { match, playerInMatch, currentPlayer } }) => {
        throwIfMatchNotInSetupState(match);

        playerInMatch.data.ready = input.readyState;

        if (allMatchSlotsReady(match)) {
          match.status = "playing";

          /**
           * TODO
           * - give first player funds, maybe we need to everything that passTurn does?
           * - set up timer
           */

          const matchStartEvent = createMatchStartEvent(match);

          const eventOnDB = await prisma.event.create({
            data: {
              content: matchStartEvent,
              matchId: match.id
            }
          });

          emit({
            ...matchStartEvent,
            matchId: match.id,
            eventIndex: eventOnDB.index
          });
        } else {
          emit({
            type: "player-changed-ready-status",
            matchId: match.id,
            playerId: currentPlayer.id,
            ready: input.readyState
          });
        }
      }
    ),
  switchCO: playerInMatchBaseProcedure
    .input(
      z.object({
        selectedCO: coIdSchema
      })
    )
    .mutation(({ input, ctx }) => {
      throwIfMatchNotInSetupState(ctx.match);

      ctx.playerInMatch.data.coId = input.selectedCO;

      emit({
        type: "player-picked-co",
        coId: input.selectedCO,
        matchId: ctx.match.id,
        playerId: ctx.currentPlayer.id
      });
    }),
  switchArmy: playerInMatchBaseProcedure
    .input(
      z.object({
        selectedArmy: armySchema
      })
    )
    .mutation(({ input, ctx }) => {
      throwIfMatchNotInSetupState(ctx.match);

      ctx.playerInMatch.data.army = input.selectedArmy;

      emit({
        type: "player-picked-army",
        army: input.selectedArmy,
        matchId: ctx.match.id,
        playerId: ctx.currentPlayer.id
      });
    })
});
