import Banner from "frontend/components/layout/Banner";
import PlayButton from "frontend/components/layout/PlayButton";
import SmallContainer from "frontend/components/layout/SmallContainer";
import ThreeLinesText from "frontend/components/layout/ThreeLinesText";
import Image from "next/image";
import { useRouter } from "next/router";

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
  const router = useRouter();
  return (
    <div className="@w-full">
      <Banner
        title={
          <div className="@flex @flex-col @w-full @h-full @items-center @justify-center smallscreen:@items-start smallscreen:@mx-[5vw]">
            <div className="@flex @flex-col @items-center">
              <div className="@flex @items-center @mb-8 smallscreen:@mb-12 laptop:@mb-24 @space-x-6 smallscreen:@space-x-12 @h-auto">
                <Image
                  className="@w-16 cellphone:@w-24 smallscreen:@w-36 monitor:@w-48"
                  src="/img/layout/logo.webp"
                  alt="AW Logo"
                  width={0}
                  height={0}
                  sizes="100vw"
                />
                <h1 className="@text-[1.2rem] cellphone:@text-[2rem] smallscreen:@text-7xl laptop:@text-8xl monitor:@text-9xl @font-russoOne">
                  WARSWORLD
                </h1>
              </div>
              <PlayButton
                onClick={() => {
                  void router.push("/your-matches");
                }}
              >
                PLAY NOW
              </PlayButton>
            </div>
          </div>
        }
        backgroundURL="/img/layout/homeBanner/Banner.jpg"
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
    </div>
  );
}
