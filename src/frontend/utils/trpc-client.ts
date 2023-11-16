import { httpBatchLink } from "@trpc/client/links/httpBatchLink";
import { loggerLink } from "@trpc/client/links/loggerLink";
import { createWSClient, wsLink } from "@trpc/client/links/wsLink";
import { createTRPCNext } from "@trpc/next";
import type { inferProcedureOutput } from "@trpc/server";
import type { NextPageContext } from "next";
import type { AppRouter } from "server/routers/app";
import superjson from "superjson";

// ℹ️ Type-only import:
// https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export

const APP_URL = process.env.NEXT_PUBLIC_APP_URL;
const WS_URL = process.env.NEXT_PUBLIC_WS_URL;

if (APP_URL === undefined || WS_URL === undefined) {
  throw new Error(
    "NEXT_PUBLIC_APP_URL or NEXT_PUBLIC_WS_URL environment variable is undefined. tRPC client can't be set up."
  );
}

const getEndingLink = (ctx: NextPageContext | undefined) => {
  if (typeof window === "undefined") {
    return httpBatchLink({
      url: `${APP_URL}/api/trpc`,
      headers() {
        if (!ctx?.req?.headers) {
          return {};
        }

        // on ssr, forward client's headers to the server
        return {
          ...ctx.req.headers,
          "x-ssr": "1",
        };
      },
    });
  }

  return wsLink<AppRouter>({
    client: createWSClient({ url: WS_URL }),
  });
};

/**
 * A set of strongly-typed React hooks
 * from your `AppRouter` type signature with `createReactQueryHooks`.
 * @link https://trpc.io/docs/react#3-create-trpc-hooks
 */
export const trpc = createTRPCNext<AppRouter>({
  config({ ctx }) {
    /**
     * If you want to use SSR, you need to use the server's full URL
     * @link https://trpc.io/docs/ssr
     */

    return {
      /**
       * @link https://trpc.io/docs/links
       */
      links: [
        // adds pretty logs to your console in development
        // and logs errors in production
        loggerLink({
          // enabled: () => false,
          enabled: (opts) =>
            (process.env.NODE_ENV === "development" &&
              typeof window !== "undefined") ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        getEndingLink(ctx),
      ],
      /**
       * @link https://trpc.io/docs/data-transformers
       */
      transformer: superjson,
      /**
       * @link https://tanstack.com/query/v4/docs/react/reference/QueryClient
       */
      queryClientConfig: { defaultOptions: { queries: { staleTime: 60 } } },
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   */
  ssr: true,
});

export type inferTRPCOutput<
  TopLevelProcedureKeys extends keyof AppRouter["_def"]["procedures"],
  SecondLevelProcedureKeys extends keyof AppRouter["_def"]["procedures"][TopLevelProcedureKeys]["_def"]["procedures"]
> = inferProcedureOutput<
  AppRouter["_def"]["procedures"][TopLevelProcedureKeys]["_def"]["procedures"][SecondLevelProcedureKeys]
>;
