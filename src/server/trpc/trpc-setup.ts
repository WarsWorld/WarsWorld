import { authMiddleware } from "./middleware/auth";
import { matchMiddleware, withMatchIdSchema } from "./middleware/match";
import { playerMiddleware, withPlayerIdSchema } from "./middleware/player";
import { t } from "./trpc-init";

export const { router } = t;
export const publicBaseProcedure = t.procedure;

export const playerBaseProcedure = t.procedure
  .input(withPlayerIdSchema)
  .use(authMiddleware)
  .use(playerMiddleware);

export const matchBaseProcedure = playerBaseProcedure
  .input(withMatchIdSchema)
  .use(matchMiddleware);

export const playerInMatchProcedure = matchBaseProcedure.use(
  matchMiddleware
    .unstable_pipe(playerMiddleware)
    .unstable_pipe(({ ctx, next }) => {
      const { match, currentPlayer } = ctx;

      const playerInMatch = match.players.getById(currentPlayer.id);

      if (playerInMatch === undefined) {
        throw new Error(
          `Current player ${currentPlayer.id} not found in match ${match.id}`
        );
      }

      return next({
        ctx: {
          ...ctx,
          playerInMatch,
        },
      });
    })
);
