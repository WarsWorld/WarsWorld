import { trpc } from "../frontend/utils/trpc-client";

//todo: delete this file/ make it more efficient
export const trpcActions = () => {
  const actionMutation = trpc.action.send.useMutation();
  return { actionMutation };
};
