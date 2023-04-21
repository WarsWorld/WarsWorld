import { Action, actionSchema } from "components/schemas/action";
import { z } from "zod";
import { publicProcedure, router } from "../trpc";

const validateAction = (action: Action) => {
  switch (action.type) {
  }
};

export const actionRouter = router({
  send: publicProcedure
    .input(z.array(actionSchema).nonempty().max(2))
    .mutation(({ input }) => {
      input.forEach(validateAction);

      // important: validate all actions first before changing server state or persisting to DB

      input.forEach((action) => {
        validateAction(action);
      });
    }),
});
