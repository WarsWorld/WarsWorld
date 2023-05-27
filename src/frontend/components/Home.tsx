import Head from "next/head";
import Banner from "./Home/Banner";
import { Layout } from "./layout";

export function Home() {
  return (
    <>
      <Head>
        <title>Home Page | Wars World</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Layout footer>
        <Banner />
      </Layout>
    </>
  );
}
