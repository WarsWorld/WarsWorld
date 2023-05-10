import { TRPCError } from "@trpc/server";
import { prisma } from "server/prisma/prisma-client";
import { z } from "zod";
import { t } from "../trpc-init";

export const withMapIdSchema = z.object({
  mapId: z.string(),
});

export const mapMiddleware = t.middleware(async ({ ctx, input, next }) => {
  const parseResult = withMapIdSchema.safeParse(input);

  if (!parseResult.success) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No mapId specified",
    });
  }

  const { mapId } = parseResult.data;

  return next({
    ctx: {
      ...ctx,
      map: await prisma.wWMap.findFirstOrThrow({ where: { id: mapId } }),
    },
  });
});
