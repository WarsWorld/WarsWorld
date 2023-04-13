import { observable } from '@trpc/server/observable';
import { publicProcedure, router } from '../trpc';
import { EventEmitter } from 'stream';
import { z } from 'zod';
import { prisma } from '../prisma';
import { Match, awbwMapToWWMap } from 'server/map-parser';
import { Prisma } from '@prisma/client';

const ee = new EventEmitter();

export const matchRouter = router({
  create: publicProcedure
    .input(
      z.object({
        playerName: z.string(),
        selectedCO: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const causticFinale = await prisma.map.findFirstOrThrow({
        where: {
          name: 'Caustic Finale',
        },
      });

      const matchState = awbwMapToWWMap();
      const { orangeStar, blueMoon } = matchState.playerState;
      orangeStar.username = input.playerName;
      orangeStar.co = input.selectedCO;
      blueMoon.username = '...';
      blueMoon.co = '';

      return prisma.match.create({
        data: {
          status: 'playing',
          matchState: awbwMapToWWMap(),
          mapId: causticFinale.id,
        },
      });
    }),
  getAll: publicProcedure.query(() => prisma.match.findMany()),
  full: publicProcedure.input(z.string()).query(async ({ input }) => {
    const thing = await prisma.match.findFirst({
      where: {
        id: input,
      },
    });

    if (thing === null) {
      return null;
    }

    return {
      ...thing,
      matchState: thing?.matchState as Match,
    };
  }),
  makeMove: publicProcedure
    .input(
      z.object({
        moveType: z.string(),
      }),
    )
    .mutation(async (data) => {
      // validate move
      // store in DB etc.
      ee.emit('move', data);
      // maybe no return necessary because of subscription ?
    }),
  moves: publicProcedure.subscription(() =>
    observable((emit) => {
      const handler = (moveData: unknown) => {
        emit.next(moveData);
      };

      ee.on('move', handler);
      return () => ee.off('move', handler);
    }),
  ),
});
