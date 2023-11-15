import { LeagueType } from "@prisma/client";
import { matchStore } from "server/match-logic/match-store";
import { prisma } from "server/prisma/prisma-client";
import { coSchema } from "server/schemas/co";
import { mapMiddleware, withMapIdSchema } from "server/trpc/middleware/map";
import { playerBaseProcedure } from "server/trpc/trpc-setup";
import { getChangeableTilesFromMap } from "shared/match-logic/get-changeable-tile-from-map";
import { PlayerInMatch } from "shared/types/server-match-state";
import { MapWrapper } from "shared/wrappers/map";
import { MatchWrapper } from "shared/wrappers/match";
import { PlayersWrapper } from "shared/wrappers/players";
import { UnitsWrapper } from "shared/wrappers/units";

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

    matchStore.set(
      matchOnDB.id,
      new MatchWrapper(
        matchOnDB.id,
        {
          leagueType: LeagueType.standard,
        },
        matchOnDB.status,
        new MapWrapper(ctx.map),
        getChangeableTilesFromMap(ctx.map),
        new UnitsWrapper([]),
        0,
        new PlayersWrapper(matchOnDB.playerState),
        "clear",
        null
      )
    );

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

    return matchStore.get(matchOnDB.id);
  });
