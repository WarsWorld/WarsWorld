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
    .mutation(async ({ input, ctx: { currentPlayer, match } }) => {
      throwIfMatchNotInSetupState(match);

      if (match.getPlayerById(currentPlayer.id) !== undefined) {
        throw new Error("You've already joined this match!");
      }

      if (match.map.data.numberOfPlayers < input.playerSlot) {

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
        eliminated: false,
        hasCurrentTurn: false,
        army: "blue-moon",
        COPowerState: "no-power",
        name: currentPlayer.name
      });

      playerMatchIndex.onPlayerJoin(player);

      await joinOrLeaveMatchPrisma(player.data.id, match.id, "join", input.playerSlot, { id: currentPlayer.id,
        slot: input.playerSlot,
        ready: false,
        coId: input.selectedCO,
        funds: 0,
        timesPowerUsed: 0,
        powerMeter: 0,
        eliminated: false,
        hasCurrentTurn: false,
        army: "blue-moon",
        COPowerState: "no-power",
        name: currentPlayer.name
      });


      emit({
        type: "player-joined",
        matchId: match.id,
        playerId: currentPlayer.id
      });
    }),
  leave: playerInMatchBaseProcedure.mutation(
    async ({ ctx: { match, player } }) => {
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

      await joinOrLeaveMatchPrisma(player.data.id, match.id, "leave", player.data.slot, );

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
        }
        //Both players are NOT ready, therefore match doesnt start
        else {
          const findMatch = await findMatchPrisma(match.id);
          findMatch.playerState[player.data.slot].ready = input.readyState;
          await updateMatchPrisma(match.id, findMatch.playerState)

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
    .mutation( async ({ input, ctx: { match, player } }) => {
      throwIfMatchNotInSetupState(match);

      player.data.coId = input.selectedCO;

      const findMatch = await findMatchPrisma(match.id);
      findMatch.playerState[player.data.slot].coId = input.selectedCO;
      await updateMatchPrisma(match.id, findMatch.playerState)

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
    .mutation(async ({ input, ctx: { match, player } }) => {
      throwIfMatchNotInSetupState(match);

      player.data.army = input.selectedArmy;

      const findMatch = await findMatchPrisma(match.id);
      findMatch.playerState[player.data.slot].army = input.selectedArmy;
      await updateMatchPrisma(match.id, findMatch.playerState)


      emit({
        type: "player-picked-army",
        army: input.selectedArmy,
        matchId: match.id,
        playerId: player.data.id
      });
    })
});

async function findMatchPrisma(matchId: string) {
  const findMatch = await prisma.match.findUnique({
    where: { id: matchId },
  });

  if (!findMatch) {
    throw new Error(`Match ID ${matchId} not found on Prisma.`);
  } else {
    return findMatch;
  }
}

async function updateMatchPrisma(matchId: string, newPlayerState: PrismaJson.PrismaPlayerState) {
  // Update the match with the modified playerState
  await prisma.match.update({
    where: { id: matchId },
    data: { playerState: newPlayerState },
  });
}

async function joinOrLeaveMatchPrisma(playerId: string, matchId:string, type:string, playerSlot: number, value?: PlayerInMatch ) {

  const findMatch = await findMatchPrisma(matchId);

  const findPlayer = await prisma.player.findUnique({
    where: { id: playerId },
  });

  if (!findPlayer) {
    throw new Error(`Player ID ${playerId} not found on Prisma.`);
  }

  switch (type) {
    case 'join':
      if (value) {
        findMatch.playerState.push(value);
      }

      break;
    case 'leave':
      findMatch.playerState.splice(playerSlot, 1);

      //TODO: This logic is only good for 1v1s (and its already bad)
      // frontend or backend need to figure out how to update playerSlots
      // right now frontend always assumes when a player joins their playerSlot is 1
      // Therefore, if one playerSlot 0 leaves,
      // then we need to make the other playerSlot 1 into playerSlot 0
      // so we dont get errors when another playerSlot 1 tries to join
      if (findMatch.playerState.length == 1) {
        findMatch.playerState[0].slot = 0;
      }

      break;
    default:
      throw new Error('Invalid update type.');
  }

  await prisma.$transaction(async (tx)=>{
    //If there are no players, then the match is deleted
    if (findMatch.playerState.length === 0) {
      await tx.match.delete({
        where: { id: matchId },
      })
    }
    //there is at least 1 player in the match
    else {
      //TODO: have to add player to the matches players[]
      await tx.match.update({
        where: { id: matchId },
        data: { playerState: findMatch.playerState, /*Player[]: add player to match here if joining OR take out if leaving */ },
      })
    }

    //TODO: Have to add match to the players matches[]

    /*    tx.player.update({
          where: { id: playerId },
          data: { matches: [findMatch] },
        })*/

  })
}