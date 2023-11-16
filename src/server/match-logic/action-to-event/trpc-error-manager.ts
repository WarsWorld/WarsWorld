import { TRPCError } from "@trpc/server";

export const badRequest = (message: string) =>
  new TRPCError({
    code: "BAD_REQUEST",
    message: message,
  });
