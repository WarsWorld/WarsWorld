/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
import type { CreateWSSContextFnOptions } from "@trpc/server/adapters/ws";
import type { CreateNextContextOptions } from "@trpc/server/src/adapters/next";
import { getSession } from "next-auth/react";

export async function createContext(opts: CreateNextContextOptions | CreateWSSContextFnOptions) {
  const session = await getSession({ req: opts.req });
  //console.log("createContext for", session?.user?.name ?? "unknown user");
  return {
    session,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
