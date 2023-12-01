import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { Context } from "./trpc-context";
import { ZodError } from "zod";

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    const zodError =
      error.code === "BAD_REQUEST" && error.cause instanceof ZodError
        ? error.cause.flatten()
        : null;

    return {
      ...shape,
      data: { ...shape.data, zodError },
    };
  },
});
