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

      <>
        <Banner />
<div className="@grid @grid-cols-[repeat(auto-fit,minmax(300px,1fr))] @gap-[4vw] @mx-[15vw] @my-20">
  <SmallContainer
    image={"matchContainer"}
    alt={"Grimm challenging you in the road"}
    title={"Matchmaking"}
    text={
      "Connect instantly with opponents of your skill level, immersing yourself in thrilling battles and ensuring a competitive experience."
    }
  />
  <SmallContainer
    image={"rivalContainer"}
    alt={"Eagle versus Andy, classic rivals"}
    title={"Competition"}
    text={
      "Engage in dynamic global clashes, rise through the ranks, and showcase your skills in adrenaline-pumping challenges."
    }
  />
  <SmallContainer
    image={"creativeContainer"}
    alt={"Jugger chilling with a tie in the beach"}
    title={"Creativity"}
    text={
      "Personalize your experience, with customizable CO portraits, color schemes, and gameplay preferences. Play your way."
    }
  />
</div>

      </>
    </section>
  );
}
