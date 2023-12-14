import { emit } from "server/emitter/event-emitter";
import { matchStore } from "server/match-store";
import { pageMatchIndex } from "server/page-match-index";
import { playerMatchIndex } from "server/player-match-index";
import { prisma } from "server/prisma/prisma-client";
import { DispatchableError } from "shared/DispatchedError";
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
  matchToFrontend,
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
    currentWeather: match.getCurrentWeather(),
    map: match.map.data,
    players: match.getAllPlayers().map(player => player.data),
    rules: match.rules,
    status: match.status,
    turn: match.turn,
    units:
      match.getPlayerById(currentPlayer.id)?.team.getEnemyUnitsInVision() ?? []
  })),
  join: matchBaseProcedure
    .input(
      z.object({
        selectedCO: coIdSchema,
        playerSlot: z.number().int().nonnegative()
      })
    )
    .mutation(({ input, ctx: { currentPlayer, match } }) => {
      throwIfMatchNotInSetupState(match);

      if (match.getPlayerById(currentPlayer.id) !== undefined) {
        throw new Error("You've already joined this match!");
      }

      if (match.map.data.numberOfPlayers >= input.playerSlot) {
        throw new DispatchableError("Invalid player slot given")
      }
      
      if (match.getPlayerBySlot(input.playerSlot) !== undefined) {
        throw new DispatchableError("Player slot is occupied")
      }

      // TODO check if selectedCO is allowed for tier/league/match-blacklist

      const player = match.addUnwrappedPlayer({
        id: currentPlayer.id,
        slot: input.playerSlot,
        ready: false,
        coId: input.selectedCO,
        funds: 0,
        timesPowerUsed: 0,
        powerMeter: 0,
        army: "orange-star",
        COPowerState: "no-power",
        name: currentPlayer.name
      });

      playerMatchIndex.onPlayerJoin(player);

      emit({
        type: "player-joined",
        matchId: match.id,
        playerId: currentPlayer.id
      });
    }),
  leave: playerInMatchBaseProcedure.mutation(
    ({ ctx: { match, player } }) => {
      throwIfMatchNotInSetupState(match);

      const { team: teamToRemoveFrom } = player
      teamToRemoveFrom.players = teamToRemoveFrom.players.filter(player2 => player2.data.slot === player.data.slot)
  
      if (teamToRemoveFrom.players.length === 0) {
        match.teams = match.teams.filter(team2 => team2 === teamToRemoveFrom)
      }

      playerMatchIndex.onPlayerLeave(player);

      if (match.teams.length === 0) {
        pageMatchIndex.removeMatch(match);
        matchStore.removeMatchFromIndex(match);
        return;
      }

      emit({
        matchId: match.id,
        type: "player-left",
        playerId: player.data.id
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
      async ({ input, ctx: { match, player } }) => {
        throwIfMatchNotInSetupState(match);

        player.data.ready = input.readyState;

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
            index: eventOnDB.index
          });
        } else {
          emit({
            type: "player-changed-ready-status",
            matchId: match.id,
            playerId: player.data.id,
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
    .mutation(({ input, ctx: { match, player } }) => {
      throwIfMatchNotInSetupState(match);

      player.data.coId = input.selectedCO;

      emit({
        type: "player-picked-co",
        coId: input.selectedCO,
        matchId: match.id,
        playerId: player.data.id
      });
    }),
  switchArmy: playerInMatchBaseProcedure
    .input(
      z.object({
        selectedArmy: armySchema
      })
    )
    .mutation(({ input, ctx: { match, player } }) => {
      throwIfMatchNotInSetupState(match);

      player.data.army = input.selectedArmy;

      emit({
        type: "player-picked-army",
        army: input.selectedArmy,
        matchId: match.id,
        playerId: player.data.id
      });
    })
});
