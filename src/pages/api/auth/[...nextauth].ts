import NextAuth from "next-auth";
import type { AppProviders } from "next-auth/providers";
import DiscordProvider from "next-auth/providers/discord";

const providers: AppProviders = [];
const clientId = process.env.DISCORD_CLIENT_ID;
const clientSecret = process.env.DISCORD_CLIENT_SECRET;

if (clientId !== undefined && clientSecret !== undefined) {
  providers.push(
    DiscordProvider({
      clientId,
      clientSecret,
    })
  );
}

export default NextAuth({ providers });
