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
import { PlayerInMatch } from "../../shared/types/server-match-state";


export const matchRouter = router({
  create: createMatchProcedure,

  getAll: publicBaseProcedure
    .input(z.object({ pageNumber: z.number().int().nonnegative() }))
    .query(({ input: { pageNumber } }) => {
       return pageMatchIndex.getPage(pageNumber).map(matchToFrontend);
      }
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
        playerSlot: z.number().int().nonnegative().nullable()
      })
    )
    .mutation(async ({ input, ctx: { currentPlayer, match } }) => {
      throwIfMatchNotInSetupState(match);

      //TODO: Should player be able to choose slot on the frontend, or should backend just provide user with the available playerSlot?
      // What sort of interface would be needed for players to choose a playerSlot (which I suppose is the spot on the map they start)
      if (match.getPlayerById(currentPlayer.id) !== undefined) {
        throw new Error("You've already joined this match!");
      }

      if (input.playerSlot !== null && match.map.data.numberOfPlayers < input.playerSlot) {
        throw new DispatchableError("Invalid player slot given");
      }

      if (input.playerSlot !== null && match.getPlayerBySlot(input.playerSlot) !== undefined) {
        throw new DispatchableError("Player slot is occupied | Frontend right now ALWAYS applies for playerSlot 1 (needs to be updated)");
      }

      //TODO check if selectedCO is allowed for tier/league/match-blacklist
      // (do players join a match with a CO pick already done or join then choose?)
      // this might not be necessary to do here but on switchCO

      // When there is not a specified slot to join, loop from 0 until an open slot is found
      let slotToJoin = 0;
      
      while(match.getPlayerBySlot(slotToJoin) !== undefined) {
        slotToJoin += 1;
      }

      const player = match.addUnwrappedPlayer({
        id: currentPlayer.id,
        slot: input.playerSlot ?? slotToJoin,
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
      //TODO: Player is already on the team

      //lets create a playerState (what the db holds) to send it to the db.
      // playerState is basically a PlayerInMatchWrapper[] (well, at least the properties of it)
      const newPlayerState = match.teams.flatMap(team =>
        team.players.map(teamPlayer => teamPlayer.data.id === player.data.id ? player.data : teamPlayer.data)
      );

      await prisma.$transaction(async (tx)=>{

        //TODO: Have to add player to match.Player[]
        await tx.match.update({ where: { id: match.id }, data: { playerState: newPlayerState, /*Player: [player] */} })

        //TODO: Have to add match to the players matches[]

        /*    await tx.player.update({
              where: { id: playerId },
              data: { matches: [findMatch] },
            })*/

      })


      emit({
        type: "player-joined",
        matchId: match.id,
        playerId: currentPlayer.id
      });
    }),
  leave: playerInMatchBaseProcedure.mutation(
    async ({ ctx: { match, player } }) => {
      throwIfMatchNotInSetupState(match);

      const { team: teamToRemoveFrom } = player;

      teamToRemoveFrom.players = teamToRemoveFrom.players.filter(teamPlayer => teamPlayer.data.slot === player.data.slot);

      if (teamToRemoveFrom.players.length === 0) {
        match.teams = match.teams.filter(team2 => team2 === teamToRemoveFrom);
      }

      playerMatchIndex.onPlayerLeave(player);

      //There is only one player so, we can remove the whole match
      if (match.teams.length === 1 && match.teams[0].players.length === 1) {
        pageMatchIndex.removeMatch(match);
        matchStore.removeMatchFromIndex(match);
        await prisma.match.delete({where: {id: match.id}})
        return;
      } else {
        //lets create a playerState (what the db holds) to send it to the db.
        // playerState is basically a PlayerInMatchWrapper[] (well, at least the properties of it)
        const newPlayerState = match.teams.flatMap(team =>
          team.players.filter(teamPlayer => teamPlayer.data.id !== player.data.id)
            .map(teamPlayer => teamPlayer.data)
        );

        await prisma.match.update({ where: { id: match.id }, data: { playerState: newPlayerState } })

        match.teams = match.teams.filter(teamToRemove => teamToRemove.index !== player.team.index )

        emit({
          matchId: match.id,
          type: "player-left",
          playerId: player.data.id
        });
      }
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


        const newPlayerData: PlayerInMatch = {
          ...player.data,
          ready: input.readyState
        }

        //lets create a playerState (what the db holds) to send it to the db.
        // playerState is basically a PlayerInMatchWrapper[] (well, at least the properties of it)
        const newPlayerState = match.teams.flatMap(team =>
          team.players.map(teamPlayer => teamPlayer.data.id === player.data.id ? newPlayerData : teamPlayer.data)
        );

        player.data.ready = input.readyState;

        if (allMatchSlotsReady(match)) {


          /**
           * TODO
           * - give first player funds, maybe we need to everything that passTurn does?
           * - set up timer
           */
          match.status = "playing";
          const matchStartEvent = createMatchStartEvent(match);

          let eventIndex: number|undefined = undefined;
          await prisma.$transaction(async (tx)=>{
             const eventOnDB = await tx.event.create({
              data: {
                content: matchStartEvent,
                matchId: match.id
              }
            });

             eventIndex = eventOnDB.index

            await tx.match.update({ where: { id: match.id }, data: { playerState: newPlayerState, status: "playing" } })
          })

          if (eventIndex !== undefined) {
            emit({
              ...matchStartEvent,
              //TODO: Fix this type-error with matchId
              matchId: match.id,
              index: eventIndex
            });
          }

        }
        //Both players are NOT ready, therefore match doesnt start
        else {


          //lets update prisma first, if the database updates, then we update memory
          await prisma.match.update({ where: { id: match.id }, data: { playerState: newPlayerState } })


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
    .mutation(async ({ input, ctx: { match, player } }) => {
      throwIfMatchNotInSetupState(match);

      const newPlayerData: PlayerInMatch = {
        ...player.data,
        coId: input.selectedCO
      }

      //lets create a playerState (what the db holds) to send it to the db.
      // playerState is basically a PlayerInMatchWrapper[] (well, at least the properties of it)
      const newPlayerState = match.teams.flatMap(team =>
        team.players.map(teamPlayer => teamPlayer.data.id === player.data.id ? newPlayerData : teamPlayer.data)
      );

      //lets update prisma first, if the database updates, then we update memory
      await prisma.match.update({ where: { id: match.id }, data: { playerState: newPlayerState } })
      player.data = newPlayerData

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

      const newPlayerData: PlayerInMatch = {
        ...player.data,
        army: input.selectedArmy
      }

      //lets create a playerState (what the db holds) to send it to the db.
      // playerState is basically a PlayerInMatchWrapper[] (well, at least the properties of it)
      const newPlayerState = match.teams.flatMap(team =>
          team.players.map(teamPlayer => teamPlayer.data.id === player.data.id ? newPlayerData : teamPlayer.data)
      );

      //lets update prisma first, if the database updates, then we update memory
      await prisma.match.update({ where: { id: match.id }, data: { playerState: newPlayerState } })
      player.data = newPlayerData

      emit({
        type: "player-picked-army",
        army: input.selectedArmy,
        matchId: match.id,
        playerId: player.data.id
      });
    })
});