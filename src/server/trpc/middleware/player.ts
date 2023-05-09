import { z } from "zod";
import { t } from "../trpc-init";
import { prisma } from "server/prisma/prisma-client";
import { Session } from "next-auth";
import { TRPCError } from "@trpc/server";

export const withPlayerIdSchema = z.object({
  playerId: z.string(),
});

export const developmentPlayerNamePrefix = "development_player";

const getDevelopmentModeUserPlayers = () =>
  prisma.player.findMany({
    where: {
      name: {
        startsWith: developmentPlayerNamePrefix,
      },
    },
  });

const getProductionModeUserPlayers = (session: Session | null) => {
  if (typeof session?.user?.name !== "string") {
    return [];
  }

  return prisma.player.findMany({
    where: {
      userId: session.user.name,
    },
  });
};

export const playerMiddleware = t.middleware(async ({ ctx, next, input }) => {
  const parseResult = withPlayerIdSchema.safeParse(input);

  if (!parseResult.success) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No playerId specified",
    });
  }

  const { playerId } = parseResult.data;

  const ownedPlayers =
    process.env.NODE_ENV === "development"
      ? await getDevelopmentModeUserPlayers()
      : await getProductionModeUserPlayers(ctx.session);

  const currentPlayer = ownedPlayers.find((p) => p.id === playerId);

  if (currentPlayer === undefined) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `You used playerId ${playerId} but you don't own that player.`,
    });
  }

  return next({
    ctx: {
      ...ctx,
      currentPlayer,
      ownedPlayers,
    },
  });
});

export const playerWithoutCurrentMiddleware = t.middleware(
  async ({ ctx, next }) => {
    const ownedPlayers =
      process.env.NODE_ENV === "development"
        ? await getDevelopmentModeUserPlayers()
        : await getProductionModeUserPlayers(ctx.session);

    return next({
      ctx: {
        ...ctx,
        ownedPlayers,
      },
    });
  }
);
