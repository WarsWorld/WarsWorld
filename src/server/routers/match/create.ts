import { LeagueType } from "@prisma/client";
import { coSchema } from "server/schemas/co";
import { getChangeableTilesFromMap } from "shared/match-logic/get-changeable-tile-from-map";
import { serverMatchStates } from "server/match-logic/server-match-states";
import { prisma } from "server/prisma/prisma-client";
import { mapMiddleware, withMapIdSchema } from "server/trpc/middleware/map";
import { playerBaseProcedure } from "server/trpc/trpc-setup";
import { PlayerInMatch } from "shared/types/server-match-state";

export const createMatchProcedure = playerBaseProcedure
  .input(
    withMapIdSchema.extend({
      selectedCO: coSchema,
    })
  )
  .use(mapMiddleware)
  .mutation(async ({ input, ctx }) => {
    const initialPlayerState: PlayerInMatch[] = [
      {
        playerId: ctx.currentPlayer.id,
        ready: false,
        playerSlot: 0,
        co: input.selectedCO,
        funds: 0,
        powerMeter: 0,
      },
    ];

    const matchOnDB = await prisma.match.create({
      data: {
        status: "setup",
        leagueType: "standard",
        playerState: initialPlayerState,
        map: {
          connect: {
            id: ctx.map.id,
          },
        },
      },
    });

    serverMatchStates.set(matchOnDB.id, {
      id: matchOnDB.id,
      map: ctx.map,
      turn: 0,
      rules: {
        leagueType: LeagueType.standard,
      },
      status: matchOnDB.status,
      changeableTiles: getChangeableTilesFromMap(ctx.map),
      players: initialPlayerState,
      units: [],
    });

    await prisma.event.create({
      data: {
        matchId: matchOnDB.id,
        content: {
          type: "player-picked-co",
          co: input.selectedCO,
          player: ctx.currentPlayer,
        },
      },
    });

    return serverMatchStates.get(matchOnDB.id);
  });
