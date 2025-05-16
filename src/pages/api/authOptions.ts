/* 
  NOTE: If you try to register or first login with two providers that have the same email, the second provider will fail.
  The first provider will register the first email and so the second cannot be registered.
*/
import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import type { Provider } from "next-auth/providers";
import CredentialsProvider from "next-auth/providers/credentials";
import type { DiscordProfile } from "next-auth/providers/discord";
import DiscordProvider from "next-auth/providers/discord";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "server/prisma/prisma-client";
import { loginSchema } from "shared/schemas/auth";
import { z } from "zod";
import WarsWorldAdapter from "./WarsWorldAdapter";

const adapter = WarsWorldAdapter(prisma) as Adapter;

const envCredential = z.string().trim().min(1);

const githubEnvSchema = z.object({
  GITHUB_CLIENT_ID: envCredential,
  GITHUB_CLIENT_SECRET: envCredential,
});

const googleEnvSchema = z.object({
  GOOGLE_CLIENT_ID: envCredential,
  GOOGLE_CLIENT_SECRET: envCredential,
});

const discordEnvSchema = z.object({
  DISCORD_CLIENT_ID: envCredential,
  DISCORD_CLIENT_SECRET: envCredential,
});

const githubEnvParsed = githubEnvSchema.safeParse(process.env);
const googleEnvParsed = googleEnvSchema.safeParse(process.env);
const discordEnvParsed = discordEnvSchema.safeParse(process.env);

const providers: Provider[] = [
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
      if (!credentials) {
        return null;
      }

      const loginParse = loginSchema.safeParse(credentials);

      if (!loginParse.success) {
        return null;
      }

      const dbUser = await prisma.user.findFirst({
        where: { name: loginParse.data.name },
      });

      if (dbUser?.password == undefined) {
        return null;
      }

      const doPasswordsMatch = await compare(loginParse.data.password, dbUser.password);

      if (!doPasswordsMatch) {
        return null;
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
      };
    },
  }),
];

if (githubEnvParsed.success) {
  providers.push(
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  );
}

if (googleEnvParsed.success) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  );
}

if (discordEnvParsed.success) {
  providers.push(
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      profile(profile: DiscordProfile) {
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
  );
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: adapter,
  debug: process.env.NODE_ENV == "development",
  providers,
  pages: {
    signIn: "/?authModalOpen",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      } else if (new URL(url).origin === baseUrl) {
        return url;
      }

      return baseUrl; // redirect callback
    },
    jwt({ token, user }) {
      if (user != undefined) {
        token.id = user.id;
      }

      token.userRole = "admin";
      return token;
    },
  },
};

export default authOptions;
