import { z } from "zod";
import { playerProcedure, router } from "../trpc/trpc-setup";

export const postRouter = router({
  add: playerProcedure
    .input(
      z.object({
        id: z.string().uuid().optional(),
        text: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { name } = ctx.user;
      const post = null;
      return post;
    }),
});
