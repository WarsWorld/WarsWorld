import { Layout } from "frontend/components/layout";
import Head from "next/head";
import { HowToPlay } from "frontend/components/HowToPlay/HowToPlay";

export default function HowToPlayPage() {
  return (
    <>
      <Head>
        <title>How To Play | Wars World</title>
      </Head>

      <Layout footer>
        <HowToPlay />
      </Layout>
    </>
  );
}
