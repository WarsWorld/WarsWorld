import { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import { prisma } from "server/prisma/prisma-client";
import { User } from "@prisma/client";

export const authConfig: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Sign in",
      credentials: {
        // TODO: Change name to a unique identifier, maybe for email or both idk.
        name: {
          label: "Username",
          type: "username",
          placeholder: "Username",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.name || !credentials.password)
          return null;

        const dbUser = await prisma.user.findFirst({
          where: { name: credentials.name },
        });

        // Verify Password here
        // TODO: Encryption here
        if (dbUser && dbUser.password === credentials.password) {
          const { password, createdAt, id, ...dbUserWithoutPassword } = dbUser;
          return dbUserWithoutPassword as User;
        }

        return null;
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
    }),
  ],
};

export default authConfig;
