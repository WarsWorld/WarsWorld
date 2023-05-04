import { ProvidePlayers } from "frontend/context/players";
import { trpc } from "frontend/utils/trpc-client";
import type { Session } from "next-auth";
import { getSession, SessionProvider } from "next-auth/react";
import type { AppType } from "next/app";
import "../frontend/styles/global.scss";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps,
}) => {
  return (
    <SessionProvider session={pageProps.session}>
      <ProvidePlayers>
        <Component {...pageProps} />
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
