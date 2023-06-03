import Head from "next/head";
import Banner from "./Home/Banner";
import SmallContainer from "./Home/SmallContainer";
import ThreeLinesText from "./Home/ThreeLinesText";
import { Layout } from "frontend/components/layout";

const homePageCards = [
  {
    image: "matchContainer",
    alt: "Grimm challenging you in the road",
    title: "Matchmaking",
    text: "Connect instantly with opponents of your skill level, immersing yourself in thrilling battles and ensuring a competitive experience.",
  },
  {
    image: "rivalContainer",
    alt: "Eagle versus Andy, classic rivals",
    title: "Competition",
    text: "Engage in dynamic global clashes, rise through the ranks, and showcase your skills in adrenaline-pumping challenges.",
  },
  {
    image: "creativeContainer",
    alt: "Jugger chilling with a tie in the beach",
    title: "Creativity",
    text: "Personalize your experience, with customizable CO portraits, color schemes, and gameplay preferences. Play your way.",
  },
];

const ThreeLinesTextButtons = [
  { text: "Play Now", link: "/register" },
  { text: "Learn to Play", link: "/howtoplay" },
];

export function Home() {
  return (
    <Layout footer>
      <Banner />
      <ThreeLinesText
        subtitle="The Timeless Classic"
        title="Renewed"
        text="The best-turn based strategy game optimized!"
        button={false}
      />
      <div className="@flex @flex-col @items-center @justify-center @gap-8 @mx-8 @my-8 cardsContainer">
        {homePageCards.map((item) => (
          <SmallContainer
            key={item.image}
            image={item.image}
            alt={item.alt}
            title={item.title}
            text={item.text}
          />
        ))}
      </div>
      <ThreeLinesText
        subtitle="1v1, Teamgames or FFA"
        title="There is a Space for You"
        text="Whether you want to be hardcore or play fun crazy maps"
        button={ThreeLinesTextButtons}
      />
    </Layout>
  );
}
