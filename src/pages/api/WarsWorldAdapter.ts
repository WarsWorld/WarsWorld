// Based on Prisma Adapter

import type { PrismaClient } from "@prisma/client";
import type { Adapter, AdapterAccount } from "@auth/core/adapters";
import type { AdapterUser } from "next-auth/adapters";
import type { Awaitable } from "next-auth";

export default function WarsWorldAdapter(p: PrismaClient): Adapter {
  return {
    createUser: async (data) => {
      const user = await p.user.create({ data });
      // Create a new user AND a player every time you log in for the first time.
      await p.player.create({
        data: {
          name: user.name ?? "",
          user: {
            connect: {
              id: user.id,
            },
          },
        },
      });
      return user as Awaitable<AdapterUser>;
    },
    getUser: (id) =>
      p.user.findUnique({ where: { id } }) as Awaitable<AdapterUser>,
    getUserByEmail: (email) =>
      p.user.findUnique({ where: { email } }) as Awaitable<AdapterUser>,
    async getUserByAccount(provider_providerAccountId) {
      const account = await p.account.findUnique({
        where: { provider_providerAccountId },
        select: { user: true },
      });
      return (account?.user as Awaitable<AdapterUser>) ?? null;
    },
    updateUser: ({ id, ...data }) =>
      p.user.update({ where: { id }, data }) as Awaitable<AdapterUser>,
    deleteUser: (id) =>
      p.user.delete({ where: { id } }) as Awaitable<AdapterUser>,
    linkAccount: (data) =>
      p.account.create({ data }) as unknown as AdapterAccount,
    unlinkAccount: (provider_providerAccountId) =>
      p.account.delete({
        where: { provider_providerAccountId },
      }) as unknown as AdapterAccount,
    // Need Session model on Prisma squema to make these functions work
    /*
    async getSessionAndUser(sessionToken) {
      const userAndSession = await p.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });
      if (!userAndSession) return null;
      const { user, ...session } = userAndSession;
      return { user, session };
    },
    createSession: (data) => p.session.create({ data }),
    updateSession: (data) =>
      p.session.update({ where: { sessionToken: data.sessionToken }, data }),
    deleteSession: (sessionToken) =>
      p.session.delete({ where: { sessionToken } }),
    async createVerificationToken(data) {
      const verificationToken = await p.verificationToken.create({ data });
      // @ts-expect-errors // MongoDB needs an ID, but we don't
      if (verificationToken.id) delete verificationToken.id;
      return verificationToken;
    },
    async useVerificationToken(identifier_token) {
      try {
        const verificationToken = await p.verificationToken.delete({
          where: { identifier_token },
        });
        // @ts-expect-errors // MongoDB needs an ID, but we don't
        if (verificationToken.id) delete verificationToken.id;
        return verificationToken;
      } catch (error) {
        // If token already used/deleted, just return null
        // https://www.prisma.io/docs/reference/api-reference/error-reference#p2025
        if ((error as Prisma.PrismaClientKnownRequestError).code === "P2025")
          return null;
        throw error;
      }
    },
    */
  };
}
