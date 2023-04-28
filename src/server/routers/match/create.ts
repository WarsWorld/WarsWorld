import { WWMap } from "@prisma/client";
import { coSchema } from "components/schemas/co";
import { Position } from "components/schemas/position";
import {
  PropertyTile,
  UnusedSiloTile,
  willBeChangeableTile,
} from "components/schemas/tile";
import {
  ChangeableTile,
  serverMatchStates,
} from "server/match-logic/server-match-states";
import { prisma } from "server/prisma/prisma-client";
import { mapMiddleware, withMapIdSchema } from "server/trpc/middleware/map";
import { playerProcedure } from "server/trpc/trpc-setup";

const getChangeableTileFromTile = (
  tile: PropertyTile | UnusedSiloTile,
  position: Position,
): ChangeableTile => {
  if (tile.type === "unused-silo") {
    return {
      type: tile.type,
      position,
      fired: false,
    };
  }

  return {
    type: tile.type,
    position,
    hp: 20,
    ownerSlot: tile.playerSlot,
  };
};

const getChangeableTilesFromMap = (map: WWMap): ChangeableTile[] => {
  const changeableTiles: ChangeableTile[] = [];

  for (const y in map.tiles) {
    const row = map.tiles[y];

    for (const x in row) {
      const tile = row[x];

      if (willBeChangeableTile(tile)) {
        const position: Position = [
          Number.parseInt(x, 10),
          Number.parseInt(y, 10),
        ];

        changeableTiles.push(getChangeableTileFromTile(tile, position));
      }
    }
  }

  return changeableTiles;
};

export const createMatchProcedure = playerProcedure
  .input(
    withMapIdSchema.extend({
      selectedCO: coSchema,
    }),
  )
  .use(mapMiddleware)
  .mutation(async ({ input, ctx }) => {
    const matchOnDB = await prisma.match.create({
      data: {
        status: "setup",
        leagueType: "standard",
        playerState: [],
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
      rules: {},
      status: matchOnDB.status,
      changeableTiles: getChangeableTilesFromMap(ctx.map),
      players: [
        {
          playerId: ctx.currentPlayer.id,
          ready: false,
          playerSlot: 0,
          co: input.selectedCO,
        },
      ],
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
