import { PixiMatch } from "frontend/components/match/main";
import { Layout } from "frontend/components/layout";
import Head from "next/head";

export default function Match() {
  return (
    <>
      <Head>
        <title>Game Page | Wars World</title>
      </Head>


        <PixiMatch />

    </>
  );
}
