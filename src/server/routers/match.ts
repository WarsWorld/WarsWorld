import { TRPCError } from "@trpc/server";
import { emit } from "server/emitter/event-emitter";
import { matchStore } from "server/match-store";
import { pageMatchIndex } from "server/page-match-index";
import { playerMatchIndex } from "server/player-match-index";
import { prisma } from "server/prisma/prisma-client";
import { DispatchableError } from "shared/DispatchedError";
import { logger } from "shared/utils/logger";
import { applyMainEventToMatch } from "shared/match-logic/events/apply-event-to-match";
import { INITIAL_FUNDS } from "shared/match-logic/game-constants/funds";
import { createMatchStartEvent } from "shared/match-logic/events/handlers/match-start";
import type { Army } from "shared/schemas/army";
import { armySchema } from "shared/schemas/army";
import { coIdSchema } from "shared/schemas/co";
import { getCOProperties } from "shared/match-logic/co";
import { playerSlotForUnitsSchema } from "shared/schemas/player-slot";
import { positionSchema } from "shared/schemas/position";
import { z } from "zod";
import type { PlayerInMatch } from "../../shared/types/server-match-state";
import {
  matchBaseProcedure,
  playerBaseProcedure,
  playerInMatchBaseProcedure,
  publicBaseProcedure,
  router,
} from "../trpc/trpc-setup";
import { createMatchProcedure } from "./match/create";
import { deriveGameOver } from "./match/game-over";
import {
  allMatchSlotsReady,
  finishedRowToFrontend,
  matchToFrontend,
  throwIfMatchNotInSetupState,
} from "./match/util";

/**
 * Reject a CO that isn't implemented for its game version (e.g. von-bolt only exists in AWDS). If it
 * slips through, `getCOProperties` throws deep in the engine and takes down that player's whole turn
 * snapshot — they can't move or build. Validate at selection so the bad combo never persists.
 */
const throwIfCOUnavailable = (selectedCO: z.infer<typeof coIdSchema>) => {
  try {
    getCOProperties(selectedCO);
  } catch (error) {
    // getCOProperties throws when the CO isn't implemented for this version. Surface that as a typed,
    // user-facing error — but don't swallow the cause: log it so an unrelated failure in CO property
    // resolution isn't silently misreported as "not available in game version".
    logger.warn(
      `[throwIfCOUnavailable] getCOProperties failed for ${selectedCO.name}/${selectedCO.version}:`,
      error instanceof Error ? error.message : error,
    );

    throw new DispatchableError(
      `CO "${selectedCO.name}" is not available in game version ${selectedCO.version}.`,
    );
  }
};

export const matchRouter = router({
  create: createMatchProcedure,

  getAll: publicBaseProcedure
    .input(z.object({ pageNumber: z.number().int().nonnegative() }))
    .query(({ input: { pageNumber } }) => {
      return pageMatchIndex.getPage(pageNumber).map(matchToFrontend);
    }),

  getPlayerMatches: playerBaseProcedure.query(
    ({ ctx: { currentPlayer } }) =>
      playerMatchIndex.getPlayerMatches(currentPlayer.id)?.map(matchToFrontend) ?? [],
  ),

  // Finished matches are archived out of the live store (rebuild skips them), so the player's
  // history is read straight from the DB. Membership lives in the `playerState` JSON (the
  // `_MatchToPlayer` relation is currently unpopulated), so filter it in memory after fetching.
  getPlayerFinishedMatches: playerBaseProcedure.query(async ({ ctx: { currentPlayer } }) => {
    const rows = await prisma.match.findMany({
      where: { status: "finished" },
      include: { map: true },
      orderBy: { finishedAt: "desc" },
    });

    return rows
      .filter((row) => row.playerState.some((player) => player.id === currentPlayer.id))
      .map(finishedRowToFrontend);
  }),
  full: matchBaseProcedure.query(({ ctx: { match, currentPlayer } }) => {
    const fogOfWar = match.isFogOfWar();
    const viewerTeam = match.getPlayerById(currentPlayer.id)?.team;

    // Only send units the viewer can actually see. `canSeeUnitAtPosition` is the single engine rule
    // for both modes: fog off → every non-concealed unit is visible (a concealed sub/stealth only to
    // its owner or an adjacent enemy); fog on → additionally gated by the team's tile vision. A
    // spectator has no team, so it sees the non-fog view minus concealed units.
    const visibleUnits = match.units.filter((unit) =>
      viewerTeam === undefined
        ? !("hidden" in unit.data && unit.data.hidden)
        : viewerTeam.canSeeUnitAtPosition(unit.data.position),
    );

    // Under fog, the tiles the viewer currently has vision of — the client darkens the rest. Empty
    // when fog is off (no overlay) or for a spectator (no team vision to expose).
    const visibleTiles: [number, number][] = [];

    if (fogOfWar && viewerTeam !== undefined) {
      for (let y = 0; y < match.map.height; y++) {
        for (let x = 0; x < match.map.width; x++) {
          if (viewerTeam.isPositionVisible([x, y])) {
            visibleTiles.push([x, y]);
          }
        }
      }
    }

    // Match outcome, DERIVED from the engine's elimination status (see deriveGameOver). We don't flip
    // match.status to "finished" here — that's a separate persistence concern (the passTurn TODO) —
    // this just lets the client show a game-over screen.
    const gameOver = deriveGameOver(match, viewerTeam);

    return {
      id: match.id,
      leagueType: match.leagueType,
      changeableTiles: match.changeableTiles,
      currentWeather: match.getCurrentWeather(),
      map: match.map.data,
      players: match.getAllPlayers().map((player) => player.data),
      rules: match.rules,
      status: match.status,
      turn: match.turn,
      units: visibleUnits.map((u) => u.data),
      fogOfWar,
      visibleTiles,
      gameOver,
    };
  }),
  join: matchBaseProcedure
    .input(
      z.object({
        selectedCO: coIdSchema,
        playerSlot: z.number().int().nonnegative().nullable(),
      }),
    )
    .mutation(async ({ input, ctx: { currentPlayer, match } }) => {
      throwIfMatchNotInSetupState(match);

      if (match.getPlayerById(currentPlayer.id) !== undefined) {
        throw new Error("You've already joined this match!");
      }

      // Shouldn't the condition be '<=' not '<'?
      // If numberOfPlayers is 2, then valid playerSlots are 0 and 1.
      // input.playerSlot of 2 would bypass this if statement.
      if (input.playerSlot !== null && match.map.data.numberOfPlayers <= input.playerSlot) {
        throw new DispatchableError("Invalid player slot given");
      }

      if (input.playerSlot !== null && match.getPlayerBySlot(input.playerSlot) !== undefined) {
        throw new DispatchableError("Player slot is occupied");
      }

      throwIfCOUnavailable(input.selectedCO);

      //TODO check if selectedCO is allowed for tier/league/match-blacklist
      // (do players join a match with a CO pick already done or join then choose?)
      // this might not be necessary to do here but on switchCO

      // When there is not a specified slot to join, loop from 0 until an open slot is found
      let slotToJoin = 0;

      while (match.getPlayerBySlot(slotToJoin) !== undefined) {
        slotToJoin += 1;
      }

      // There should be code earlier in this flow that prevents this if statement from being true.
      if (match.map.data.numberOfPlayers <= slotToJoin) {
        throw new DispatchableError("Match is full");
      }

      const armiesOccupied = match.getAllPlayers().map((player) => player.data.army as string);
      const availableArmies = Object.keys(armySchema.Values).filter(
        (army) => !armiesOccupied.includes(army),
      );

      const player = match.addUnwrappedPlayer({
        id: currentPlayer.id,
        slot: input.playerSlot ?? slotToJoin,
        ready: false,
        coId: input.selectedCO,
        // Players start at zero; income is granted per turn (day 1 in applyMatchStartEvent).
        funds: INITIAL_FUNDS,
        timesPowerUsed: 0,
        powerMeter: 0,
        status: "alive",
        hasCurrentTurn: false,
        army: availableArmies[(Math.random() * availableArmies.length) | 0] as Army,
        // army: availableArmies[0] as Army, // use this if there are performance concerns with Math.random
        COPowerState: "no-power",
        name: currentPlayer.name,
      });

      playerMatchIndex.onPlayerJoin(player);
      //TODO: Player is already on the team

      //lets create a playerState (what the db holds) to send it to the db.
      // playerState is basically a PlayerInMatchWrapper[] (well, at least the properties of it)
      const newPlayerState = match.teams.flatMap((team) =>
        team.players.map((teamPlayer) =>
          teamPlayer.data.id === player.data.id ? player.data : teamPlayer.data,
        ),
      );

      await prisma.$transaction(async (tx) => {
        //TODO: Have to add player to match.Player[]
        await tx.match.update({
          where: { id: match.id },
          data: { playerState: newPlayerState /*Player: [player] */ },
        });

        //TODO: Have to add match to the players matches[]

        /*    await tx.player.update({
              where: { id: playerId },
              data: { matches: [findMatch] },
            })*/
      });
      //@ts-expect-error emit needs to be updated
      emit({
        type: "player-joined",
        matchId: match.id,
        playerId: currentPlayer.id,
      });
    }),
  leave: playerInMatchBaseProcedure.mutation(async ({ ctx: { match, player } }) => {
    throwIfMatchNotInSetupState(match);

    const { team: teamToRemoveFrom } = player;

    teamToRemoveFrom.players = teamToRemoveFrom.players.filter(
      (teamPlayer) => teamPlayer.data.slot === player.data.slot,
    );

    if (teamToRemoveFrom.players.length === 0) {
      match.teams = match.teams.filter((team2) => team2 === teamToRemoveFrom);
    }

    playerMatchIndex.onPlayerLeave(player);

    //There is only one player so, we can remove the whole match
    if (match.teams.length === 1 && match.teams[0].players.length === 1) {
      pageMatchIndex.removeMatch(match);
      matchStore.removeMatchFromIndex(match);
      await prisma.match.delete({ where: { id: match.id } });
    } else {
      //lets create a playerState (what the db holds) to send it to the db.
      // playerState is basically a PlayerInMatchWrapper[] (well, at least the properties of it)
      const newPlayerState = match.teams.flatMap((team) =>
        team.players
          .filter((teamPlayer) => teamPlayer.data.id !== player.data.id)
          .map((teamPlayer) => teamPlayer.data),
      );

      await prisma.match.update({ where: { id: match.id }, data: { playerState: newPlayerState } });

      match.teams = match.teams.filter((teamToRemove) => teamToRemove.index !== player.team.index);
      //@ts-expect-error emit needs to be updated
      emit({
        matchId: match.id,
        type: "player-left",
        playerId: player.data.id,
      });
    }
  }),
  setReady: playerInMatchBaseProcedure
    .input(
      z.object({
        readyState: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx: { match, player } }) => {
      throwIfMatchNotInSetupState(match);

      const newPlayerData: PlayerInMatch = {
        ...player.data,
        ready: input.readyState,
      };

      //lets create a playerState (what the db holds) to send it to the db.
      // playerState is basically a PlayerInMatchWrapper[] (well, at least the properties of it)
      const newPlayerState = match.teams.flatMap((team) =>
        team.players.map((teamPlayer) =>
          teamPlayer.data.id === player.data.id ? newPlayerData : teamPlayer.data,
        ),
      );

      player.data.ready = input.readyState;

      if (allMatchSlotsReady(match)) {
        /**
         * TODO
         * - set up timer
         */
        match.status = "playing";
        const matchStartEvent = createMatchStartEvent(match);

        let eventIndex: number | undefined = undefined;
        await prisma.$transaction(async (tx) => {
          const eventOnDB = await tx.event.create({
            data: {
              content: matchStartEvent,
              matchId: match.id,
            },
          });

          eventIndex = eventOnDB.index;

          // Persist the pre-start snapshot (funds still at INITIAL_FUNDS). Day-1 income is applied
          // by the matchStart event below and re-derived by replaying it on rebuild, so it must NOT
          // be baked into this snapshot or it would be granted twice.
          await tx.match.update({
            where: { id: match.id },
            data: { playerState: newPlayerState, status: "playing" },
          });
        });

        // Bring the in-memory match to the same state a rebuild would produce from the event log:
        // grant the starting player their first turn's income.
        applyMainEventToMatch(match, matchStartEvent);

        if (eventIndex !== undefined) {
          //@ts-expect-error emit needs to be updated
          emit({
            ...matchStartEvent,
            //TODO: Fix this type-error with matchId
            matchId: match.id,
            // index: eventIndex
          });
        }
      }
      //Both players are NOT ready, therefore match doesnt start
      else {
        //lets update prisma first, if the database updates, then we update memory
        await prisma.match.update({
          where: { id: match.id },
          data: { playerState: newPlayerState },
        });

        //@ts-expect-error emit needs to be updated
        emit({
          type: "player-changed-ready-status",
          matchId: match.id,
          playerId: player.data.id,
          ready: input.readyState,
        });
      }
    }),
  switchOptions: playerInMatchBaseProcedure
    .input(
      z.object({
        selectedCO: coIdSchema.optional(),
        selectedArmy: armySchema.optional(),
        selectedSlot: playerSlotForUnitsSchema.optional(),
      }),
    )
    .mutation(async ({ input, ctx: { match, player } }) => {
      throwIfMatchNotInSetupState(match);

      if (input.selectedCO !== undefined) {
        throwIfCOUnavailable(input.selectedCO);
      }

      const newPlayerData: PlayerInMatch = { ...player.data };
      newPlayerData.coId = input.selectedCO ?? newPlayerData.coId;
      newPlayerData.army = input.selectedArmy ?? newPlayerData.army;
      newPlayerData.slot = input.selectedSlot ?? newPlayerData.slot;

      const armiesOccupied = match.getAllPlayers().map((player) => player.data.army as string);
      const slotsOccupied = match.getAllPlayers().map((player) => player.data.slot);

      // ERROR CHECKING
      // make sures that the ARMY picked by the player is different from all other players
      if (input.selectedArmy !== undefined && armiesOccupied.includes(input.selectedArmy)) {
        throw new DispatchableError("Army is already picked by another player");
      }

      // make sures that the SLOT picked by the player is different from all other players
      if (input.selectedSlot !== undefined && slotsOccupied.includes(input.selectedSlot)) {
        throw new DispatchableError("Slot is already picked by another player");
      }

      // UPDATING STATE
      //lets create a playerState (what the db holds) to send it to the db.
      // playerState is basically a PlayerInMatchWrapper[] (well, at least the properties of it)
      const newPlayerState = match.teams.flatMap((team) =>
        team.players.map((teamPlayer) =>
          teamPlayer.data.id === player.data.id ? newPlayerData : teamPlayer.data,
        ),
      );

      //lets update prisma first, if the database updates, then we update memory
      await prisma.match.update({ where: { id: match.id }, data: { playerState: newPlayerState } });
      player.data = newPlayerData;

      if (input.selectedCO !== undefined) {
        //@ts-expect-error emit needs to be updated
        emit({
          type: "player-picked-co",
          coId: input.selectedCO,
          matchId: match.id,
          playerId: player.data.id,
        });
      }

      if (input.selectedArmy !== undefined) {
        //@ts-expect-error emit needs to be updated
        emit({
          type: "player-picked-army",
          army: input.selectedArmy,
          matchId: match.id,
          playerId: player.data.id,
        });
      }

      if (input.selectedSlot !== undefined) {
        //@ts-expect-error emit needs to be updated
        emit({
          type: "player-picked-slot",
          slot: input.selectedSlot,
          matchId: match.id,
          playerId: player.data.id,
        });
      }
    }),
  adminUnwaitUnit: matchBaseProcedure
    .input(z.object({ position: positionSchema }))
    .mutation(({ input, ctx }) => {
      // TODO if ctx.user doesn't have the permissions to do this (e.g. isn't an admin)
      // then throw a tRPC error for unauthorized

      const unit = ctx.match.getUnitOrThrow(input.position);

      if (unit.data.isReady) {
        throw new TRPCError({
          message: "Unit is already ready (unwaited)",
          code: "BAD_REQUEST",
        });
      }

      unit.data.isReady = true;
    }),
});
