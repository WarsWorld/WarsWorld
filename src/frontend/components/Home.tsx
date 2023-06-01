import Head from "next/head";
import Banner from "./Home/Banner";
import SmallContainer from "./Home/SmallContainer";
import ThreeLinesText from "./Home/ThreeLinesText";
export function Home() {
  return (
    <section>
      <Head>
        <title>Home Page | Wars World</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <>
        <Banner />
        <ThreeLinesText
          subtitle={"The Timeless Classic"}
          title={"Renewed"}
          text={"The best-turn based strategy game optimized!"}
          button={false}
        />

        <div className="@grid @grid-cols-[repeat(auto-fit,minmax(260px,1fr))] @gap-[4vw] @mx-[15vw] @my-10">
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
        <ThreeLinesText
          subtitle={"1v1, Teamgames or FFA"}
          title={"There is a Space for You"}
          text={"Whether you want to be hardcore or play fun crazy maps"}
          button={[
            {
              text: "Play Now",
              link: "/register",
            },
            {
              text: "Learn to Play",
              link: "/learn",
            },
          ]}
        />
      </>
    </section>
  );
}
