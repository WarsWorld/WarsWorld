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
        image1={{
          className: "pixelated",
          src: "/img/layout/homeBanner/classicInfantry.png",
          width: 42 * 5,
          height: 42 * 5,
          alt: "Classic Infantry",
        }}
        title={
          <>
            <h1>
              Relive the <strong>Nostalgia</strong>
              <br />
              Rewrite the Tactics
            </h1>
            <button className="btn">Play Now</button>
          </>
        }
        backgroundURL="/img/layout/homeBanner/gameCollage.jpg"
        image2={{
          className: "pixelated @scale-x-[-1]",
          src: "/img/layout/homeBanner/newInfantry.png",
          width: 42 * 5,
          height: 42 * 5,
          alt: "New Infantry",
        }}
      />
      <ThreeLinesText
        subtitle="The Timeless Classic"
        title="Renewed"
        text="The best-turn based strategy game optimized!"
      />
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
      <ThreeLinesText
        subtitle="1v1, Teamgames or FFA"
        title="There is a Space for You"
        text="Whether you want to be hardcore or play fun crazy maps"
        button={[
          { text: "Play Now", link: "/register" },
          { text: "Learn to Play", link: "/learn" },
        ]}
      />
    </>
  );
}
