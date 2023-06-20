import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]";
import { Layout } from "../frontend/components/layout";

import type { GetServerSidePropsContext } from "next";
import { useSession } from "next-auth/react";

export default function ServerSidePage() {
  const { data: session } = useSession();
  // Server side rendering test
  return (
    <Layout>
      <h1>Server Side Rendering</h1>
      <p>No client side javascript needed</p>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </Layout>
  );
}

// Export the `session` prop to use sessions with Server Side Rendering
export async function getServerSideProps(context: GetServerSidePropsContext) {
  return {
    props: {
      session: await getServerSession(context.req, context.res, authOptions),
    },
  };
}
