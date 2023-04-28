import { authMiddleware } from "./middleware/auth";
import { matchMiddleware, withMatchIdSchema } from "./middleware/match";
import { playerMiddleware, withPlayerIdSchema } from "./middleware/player";
import { t } from "./trpc-init";

export const { router } = t;
export const publicProcedure = t.procedure;

export const playerProcedure = t.procedure
  .input(withPlayerIdSchema)
  .use(authMiddleware)
  .use(playerMiddleware);

export const matchProcedure = t.procedure
  .input(withMatchIdSchema)
  .use(authMiddleware)
  .use(playerMiddleware)
  .use(matchMiddleware);
