import { router } from "../trpc/trpc-setup";
import { actionRouter } from "./action";
import { mapRouter } from "./map";
import { matchRouter } from "./match";
import { postRouter } from "./post";
import { userRouter } from "./user";

export const appRouter = router({
  post: postRouter,
  match: matchRouter,
  map: mapRouter,
  action: actionRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
