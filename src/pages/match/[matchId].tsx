import Head from "next/head";
import { PixiMatch } from "frontend/components/match/main";
import { Layout } from "frontend/components/layout";

export default function Match() {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Layout>
        <PixiMatch />
      </Layout>
    </>
  );
}
