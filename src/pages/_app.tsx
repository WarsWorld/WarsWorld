import type { Session } from "next-auth";
import { getSession, SessionProvider } from "next-auth/react";
import type { AppType } from "next/app";
import { trpc } from "utils/trpc-client";
import "../styles/global.scss";
import { ProvidePlayers } from "components/provide-players";

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
