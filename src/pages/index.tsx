import Head from "next/head";
import { Home } from "../frontend/components/Home";

export default function IndexPage() {
  return (
    <>
      <Head>
        <title>Home Page | Wars World</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Home />
    </>
  );
}
