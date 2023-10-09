import SquareButton from "frontend/components/layout/SquareButton";
import Banner from "../../frontend/components/layout/Banner";
import SmallContainer from "../../frontend/components/layout/SmallContainer";
import ThreeLinesText from "../../frontend/components/layout/ThreeLinesText";

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

export default function BasicHome() {
  return (
    <>
      <Banner
        title={
          <>
            <h1 className="@text-[1.25rem] tablet:@text-[3rem] smallscreen:@text-[3.5rem] monitor:@text-[5rem] large_monitor:@text-[7rem]">
              Relive the <strong>Nostalgia</strong>
              <br />
              Rewrite the Tactics
            </h1>
            <div className="@flex @justify-center">
              <div className="@mt-4 tablet:@mt-12 @h-12 tablet:@h-20 monitor:@h-24 large_monitor:@h-28 @text-xl tablet:@text-4xl monitor:@text-5xl large_monitor:@text-6xl @w-[50vw] tablet:@w-[50%] @shadow-lg @shadow-black">
                <SquareButton onClick={undefined}>Play Now</SquareButton>
              </div>
            </div>
          </>
        }
        backgroundURL="/img/layout/homeBanner/gameCollage.jpg"
      />
      <div className="@my-1 tablet:@my-4">
        <ThreeLinesText
          subtitle="The Timeless Classic"
          title="Renewed"
          text="The best-turn based strategy game optimized!"
        />
      </div>
      <div className="@flex @flex-col @items-center @justify-center @gap-8 @mx-8 @my-8 laptop:@flex-row">
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
      <div className="@mb-16">
        <ThreeLinesText
          subtitle="1v1, Teamgames or FFA"
          title="There is a Space for You"
          text="Whether you want to be hardcore or play fun crazy maps"
          button={[
            { text: "Play Now", link: "/your-matches" },
            { text: "Learn to Play", link: "/howtoplay" },
          ]}
        />
      </div>
    </>
  );
}
