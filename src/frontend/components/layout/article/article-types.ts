import type { inferTRPCOutput } from "frontend/utils/trpc-client";

// Comment shape as returned by the API — derived via tRPC type inference (the sanctioned FE<->BE
// contract), not by importing backend code.
export type ArticleCommentsWithPlayer = NonNullable<
  inferTRPCOutput<"article", "getMarkdownById">
>["Comments"];
