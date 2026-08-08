import { mapRouter } from "../maps/router";
import { router } from "../trpc/trpc-setup";
import { actionRouter } from "./action";
import { matchRouter } from "./match";
import { matchPreviewRouter } from "./match/previews";
import { articleRouter } from "./article";
import { userRouter } from "./user";

export const appRouter = router({
  article: articleRouter,
  match: matchRouter,
  matchPreview: matchPreviewRouter,
  map: mapRouter,
  action: actionRouter,
  user: userRouter,
});

export type AppRouter = typeof appRouter;
