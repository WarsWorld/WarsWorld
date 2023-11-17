import { matchStore } from "server/match-store";
import { prisma } from "server/prisma/prisma-client";
import { coSchema } from "shared/schemas/co";
import { mapMiddleware, withMapIdSchema } from "server/trpc/middleware/map";
import { playerBaseProcedure } from "server/trpc/trpc-setup";
import type { PlayerInMatch } from "shared/types/server-match-state";
import { matchStateToFrontend } from "../match";

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
        slot: 0,
        co: input.selectedCO,
        funds: 0,
        powerMeter: 0,
        army: "orange-star",
        COPowerState: "no-power",
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

    await prisma.event.create({
      data: {
        matchId: matchOnDB.id,
        content: {
          type: "player-picked-co",
          co: input.selectedCO,
          playerId: ctx.currentPlayer.id,
        },
      },
    });

    const match = matchStore.createMatchAndStore(matchOnDB, ctx.map);
    return matchStateToFrontend(match);
  });
