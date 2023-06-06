import Head from "next/head";
import { HowToPlay } from "frontend/components/HowToPlay/HowToPlay";

export default function IndexPage() {
  return (
    <>
      <Head>
        <title>Wars World Guides</title>
      </Head>

      <HowToPlay />
    </>
  );
}
