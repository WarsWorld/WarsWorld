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
