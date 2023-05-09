import { z } from "zod";
import { playerBaseProcedure, router } from "../trpc/trpc-setup";

export const postRouter = router({
  add: playerBaseProcedure
    .input(
      z.object({
        id: z.string().uuid().optional(),
        text: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // TODO
    }),
});
