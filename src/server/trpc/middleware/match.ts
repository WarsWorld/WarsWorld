import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { t } from "../trpc-init";
import { matchStore } from "server/match-store";
import type { Match } from "@prisma/client";

export const withMatchIdSchema = z.object<{ matchId: z.ZodType<Match["id"]> }>({
  matchId: z.string(),
});

export type WithMatchId = z.infer<typeof withMatchIdSchema>;

export const matchMiddleware = t.middleware(async ({ ctx, input, next }) => {
  const parseResult = withMatchIdSchema.safeParse(input);

  if (!parseResult.success) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No matchId specified",
    });
  }

  const { matchId } = parseResult.data;

  const match = matchStore.get(matchId);

  if (match === undefined) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `Match with id ${matchId} not found`,
    });
  }

  return next({
    ctx: {
      ...ctx,
      match,
    },
  });
});
