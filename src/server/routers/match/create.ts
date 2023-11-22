import { matchStore } from "server/match-store";
import { prisma } from "server/prisma/prisma-client";
import { coSchema } from "shared/schemas/co";
import { mapMiddleware, withMapIdSchema } from "server/trpc/middleware/map";
import { playerBaseProcedure } from "server/trpc/trpc-setup";
import type { PlayerInMatch } from "shared/types/server-match-state";
import { matchToFrontend } from "./util";

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
        id: ctx.currentPlayer.id,
        ready: false,
        slot: 0,
        co: input.selectedCO,
        funds: 0,
        powerMeter: 0,
        army: "orange-star",
        COPowerState: "no-power",
        timesPowerUsed: 0,
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
        rules: {
          /* TODO good default values or user input values or enforce league rules or whatever */
          bannedUnitTypes: [],
          captureLimit: 100,
          dayLimit: 100,
          fogOfWar: false,
          fundsPerProperty: 1000,
          unitCapPerPlayer: 50,
          weatherSetting: "clear",
        },
      },
    });

    const match = matchStore.createMatchAndIndex(matchOnDB, ctx.map);
    return matchToFrontend(match);
  });
