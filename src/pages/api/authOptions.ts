/* 
  NOTE: If you try to register or first login with two providers that have the same email, the second provider will fail.
  The first provider will register the first email and so the second cannot be registered.
*/
import type { NextAuthOptions } from "next-auth";
import type { Adapter } from "next-auth/adapters";
import type { Provider } from "next-auth/providers";
import type { DiscordProfile } from "next-auth/providers/discord";
import DiscordProvider from "next-auth/providers/discord";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "server/prisma/prisma-client";
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

const providers: Provider[] = [];

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
      const callbackUrl = url.split("?").pop();
      const searchParams = new URLSearchParams(callbackUrl).get("callbackUrl");

      if (searchParams != null) {
        return searchParams;
      }

      url = url.replace("authModalOpen", "");

      if (url.endsWith("?")) {
        url = url.slice(0, -1);
      }

      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      if (new URL(url).origin === baseUrl) {
        return url;
      }

      return baseUrl;
    },
    jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.id = user?.id;
      }

      return token;
    },
    session({ session, token }) {
      // Send properties to the client, like an access_token from a provider.
      const newUserSession = { ...session.user, id: token.id };

      return { ...session, user: newUserSession };
    },
  },
};

export default authOptions;
