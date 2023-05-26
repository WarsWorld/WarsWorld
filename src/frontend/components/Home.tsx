import Head from "next/head";
import Banner from "./Home/Banner";
export function Home() {
  return (
    <section>
      <Head>
        <title>Home Page | Wars World</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        <Banner />
      </div>
    </section>
  );
}
