import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { Context } from "./trpc-context";

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});
