import { TRPCError } from "@trpc/server";
import { authMiddleware } from "./middleware/auth";
import { matchMiddleware, withMatchIdSchema } from "./middleware/match";
import { playerMiddleware, withPlayerIdSchema } from "./middleware/player";
import { t } from "./trpc-init";
import { DispatchableError } from "shared/DispatchedError";

export const { router } = t;
export const publicBaseProcedure = t.procedure;

export const playerBaseProcedure = t.procedure
  .input(withPlayerIdSchema)
  .use(authMiddleware)
  .use(playerMiddleware);

export const matchBaseProcedure = playerBaseProcedure
  .input(withMatchIdSchema)
  .use(matchMiddleware);

export const playerInMatchBaseProcedure = matchBaseProcedure.use(
  matchMiddleware
    .unstable_pipe(playerMiddleware)
    .unstable_pipe(({ ctx, next }) => {
      const { match, currentPlayer } = ctx;

      const player = match.players.getCurrentTurnPlayer();

      if (player.data.playerId !== currentPlayer.id) {
        throw new DispatchableError("It's not your turn");
      }

      return next({
        ctx: {
          ...ctx,
          playerInMatch: player,
        },
      });
    })
);
