import { TRPCError } from "@trpc/server";
import { getMatchState } from "server/match-logic/server-match-states";
import { z } from "zod";
import { t } from "../trpc-init";
import { BackendMatchState } from "shared/types/server-match-state";

export const withMatchIdSchema = z.object({
  matchId: z.string(),
});

export const matchMiddleware = t.middleware(async ({ ctx, input, next }) => {
  const parseResult = withMatchIdSchema.safeParse(input);

  if (!parseResult.success) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No matchId specified",
    });
  }

  const { matchId } = parseResult.data;

  let match: BackendMatchState | null = null;

  try {
    match = getMatchState(matchId);
  } catch (error) {
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
