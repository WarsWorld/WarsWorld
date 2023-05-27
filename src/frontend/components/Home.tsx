import Head from "next/head";
import Banner from "./Home/Banner";
import SmallContainer from "./Home/SmallContainer";
export function Home() {
  return (
    <section>
      <Head>
        <title>Home Page | Wars World</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        <Banner />
        <SmallContainer image={"matchContainer"} text={"Connect instantly with opponents of your skill level, immersing yourself in thrilling battles and ensuring a competitive experience."}/>
      </div>
    </section>
  );
}
