import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import DiscordProvider from "next-auth/providers/discord";
import { z } from "zod";
import { Provider } from "next-auth/providers";

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
      clientId: githubEnvParsed.data.GITHUB_CLIENT_ID,
      clientSecret: githubEnvParsed.data.GITHUB_CLIENT_SECRET,
    })
  );
}

if (googleEnvParsed.success) {
  providers.push(
    GoogleProvider({
      clientId: googleEnvParsed.data.GOOGLE_CLIENT_ID,
      clientSecret: googleEnvParsed.data.GOOGLE_CLIENT_SECRET,
    })
  );
}

if (discordEnvParsed.success) {
  providers.push(
    DiscordProvider({
      clientId: discordEnvParsed.data.DISCORD_CLIENT_ID,
      clientSecret: discordEnvParsed.data.DISCORD_CLIENT_SECRET,
    })
  );
}

// This is the temp big daddy of scripts I've been working on
// This is a simple implementation of OAuth with 2 providers
// My main auth script that uses credentials is still WIP
export const authOptions: NextAuthOptions = {
  providers,
  callbacks: {
    async jwt({ token }) {
      token.userRole = "admin";
      return token;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl; // redirect callback
    },
  },
};

export default NextAuth(authOptions);
