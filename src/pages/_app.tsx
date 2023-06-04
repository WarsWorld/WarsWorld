import { ProvidePlayers } from "frontend/context/players";
import { trpc } from "frontend/utils/trpc-client";
import type { Session } from "next-auth";
import { getSession, SessionProvider } from "next-auth/react";
import type { AppType } from "next/app";
import Head from "next/head";
import "../frontend/styles/global.scss";
import { Layout } from "../frontend/components/layout";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps,
}) => {
  return (
    <SessionProvider session={pageProps.session}>
      <Head>
        <title>Wars World</title>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, minimum-scale=1"
        />
      </Head>
      <ProvidePlayers>
        <Layout>
          <Component {...pageProps} />
        </Layout>

      </ProvidePlayers>
    </SessionProvider>
  );
};

MyApp.getInitialProps = async ({ ctx }) => {
  return {
    session: await getSession(ctx),
  };
};

export default trpc.withTRPC(MyApp);
