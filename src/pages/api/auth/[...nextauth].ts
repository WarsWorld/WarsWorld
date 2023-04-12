import NextAuth from 'next-auth';
import { AppProviders } from 'next-auth/providers';
import DiscordProvider from 'next-auth/providers/discord';

const providers: AppProviders = [
  DiscordProvider({
    clientId: '1095434263308025978',
    clientSecret: 'bB3DyXqehDToNPnKnXeiHTUauNVhZtxh',
  }),
];

export default NextAuth({ providers });
