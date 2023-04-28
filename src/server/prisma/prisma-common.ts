import { prisma } from "./prisma-client";

export const getMatchOrThrow = (matchId: string) =>
  prisma.match.findFirstOrThrow({
    where: { id: matchId },
  });
