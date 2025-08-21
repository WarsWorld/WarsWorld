import { matchStore } from "server/match-store";
import { prisma } from "server/prisma/prisma-client";
import { mapMiddleware } from "server/trpc/middleware/map";
import { playerBaseProcedure } from "server/trpc/trpc-setup";
import { matchRulesSchema } from "shared/schemas/match-rules";
import { z } from "zod";
import { matchToFrontend } from "./util";

export const createMatchProcedure = playerBaseProcedure
  .input(
    z.object({
      rules: matchRulesSchema,
      mapId: z.string(),
      vsComputer: z.boolean().optional().default(false),
    }),
  )
  .use(mapMiddleware)
  .mutation(async ({ input, ctx }) => {
    // Prepare initial player state
    const initialPlayerState = [
      {
        slot: 0,
        hasCurrentTurn: true,
        id: ctx.currentPlayer.id,
        name: ctx.currentPlayer.name,
        ready: false,
        coId: {
          name: "andy",
          version: "AW2",
        },
        status: "alive",
        //TODO: Handle funds correctly
        funds: 10000,
        powerMeter: 0,
        timesPowerUsed: 0,
        army: "orange-star",
        COPowerState: "no-power",
      },
    ];

    // If vsComputer is true, add a computer player
    if (input.vsComputer) {
      initialPlayerState.push({
        slot: 1,
        hasCurrentTurn: false,
        id: "computer-player-001",
        name: "Computer",
        ready: true, // Computer is always ready
        coId: {
          name: "andy", // Default CO for computer
          version: "AW2",
        },
        status: "alive",
        funds: 10000,
        powerMeter: 0,
        timesPowerUsed: 0,
        army: "blue-moon", // Different army from player
        COPowerState: "no-power",
      });
    }

    const matchOnDB = await prisma.match.create({
      data: {
        status: "setup",
        leagueType: "standard",
        mode: input.vsComputer ? "pvc" : "pvp",
        playerState: initialPlayerState,
        map: {
          connect: {
            id: ctx.map.id,
          },
        },
        rules: input.rules,
      },
    });

    const match = matchStore.createMatchAndIndex(matchOnDB, ctx.map);
    return matchToFrontend(match);
  });
