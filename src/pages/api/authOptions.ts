/* 
  NOTE: If you try to register or first login with two providers that have the same email, the second provider will fail.
  The first provider will register the first email and so the second cannot be registered.
*/
import { NextAuthOptions } from "next-auth";
import DiscordProvider, { DiscordProfile } from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { User } from "@prisma/client";
import { loginSchema } from "server/schemas/auth";
import { Adapter } from "next-auth/adapters";
import { prisma } from "server/prisma/prisma-client";
import WarsWorldAdapter from "./WarsWorldAdapter";
import { compare } from "bcrypt";

const adapter = WarsWorldAdapter(prisma) as Adapter;

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: adapter,
  debug: true,
  providers: [
    CredentialsProvider({
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
          placeholder: "Password",
        },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.name || !credentials.password)
          return null;

        const creds = await loginSchema.parseAsync({
          username: credentials.name,
          password: credentials.password,
        });

        const dbUser = await prisma.user.findFirst({
          where: { name: creds.username },
        });

        if (
          dbUser &&
          dbUser.password &&
          (await compare(credentials.password, dbUser.password))
        ) {
          const dbUserWithoutPassword = {
            name: dbUser.name,
            email: dbUser.email,
          };
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
      async profile(profile: DiscordProfile) {
        /* 
          For some reason Discord provider doesn't send the user's data properly.
          It probably expects another type of squema.
          That's why I manually made the object here.
          This object is going to be fed into prisma.user.create() behind the scenes.
        */
        return {
          id: profile.id,
          name: profile.username,
          email: profile.email,
          emailVerified: null,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  pages: {
    signIn: "/?authModalOpen",
    error: "/?authModalOpen",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl; // redirect callback
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      token.userRole = "admin";
      return token;
    },
  },
};

export default authOptions;
