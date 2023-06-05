import HowToPlaySection from "./HowToPlaySection";
import ThreeLinesText from "../Home/ThreeLinesText";

export function HowToPlay() {
  const data = [
    {
      key: "s1",
      title: "Basics",
      description:
        "If you are a new player, these guides will help you establish the basic fundamentals of the game",
      color: "@bg-green-500",
      articles: [
        {
          key: "t1",
          heading: "Master the Basics",
          text: "Learn about unit types, terrain effects, and the turn-based gameplay.",
          image: "/img/HowToPlay/pic1.jpg",
          link: "/",
        },
        {
          key: "t2",
          heading: "Resource Management",
          text: "Understand how to efficiently produce units and manage funds.",
          image: "/img/HowToPlay/pic2.jpg",
          link: "/",
        },
        {
          key: "t3",
          heading: "Map Awareness",
          text: "Study the map to identify chokepoints, advantageous positions, and key objectives.",
          image: "/img/HowToPlay/pic3.jpg",
          link: "/",
        },
        {
          key: "t4",
          heading: "Fog of War",
          text: "Learn to adapt to limited visibility and use recon units effectively.",
          image: "/img/HowToPlay/pic4.jpg",
          link: "/",
        },
      ],
    },
    {
      key: "s3",
      title: "Matches",
      description: "You can learn here how you can create or join a match.",
      articles: [
        {
          key: "t1",
          heading: "Create or join a match",
          text: "Learn how to create public or privates matches or join them.",
          image: "/img/HowToPlay/pic9.jpg",
          link: "/",
        },
        {
          key: "t2",
          heading: "Enter the Global League",
          text: "Intimidated by the Global League? Here we'll talk about everything you need to know.",
          image: "/img/HowToPlay/pic8.jpg",
          link: "/",
        },
        {
          key: "t3",
          heading: "Play in a tournament",
          text: "Do you want to join a tournament? Here we'll explain the rules.",
          image: "/img/HowToPlay/pic7.jpg",
          link: "/",
        },
      ],
    },
    {
      key: "s2",
      title: "Advance",
      description:
        "These guides will cover more advanced techniques with specific uses that can give you the edge on the battlefield.",
      color: "@bg-orange-500",
      articles: [
        {
          key: "t5",
          heading: "Indirect Units",
          text: "Learn how to use indirect units properly.",
          image: "/img/HowToPlay/pic5.jpg",
          link: "/",
        },
        {
          key: "t6",
          heading: "Tech-ups",
          text: "What's a tech-up and how to do it properly? Here we'll answer those questions.",
          image: "/img/HowToPlay/pic6.jpg",
          link: "/",
        },
      ],
    },
  ];

  return (
    /*  
      Shows titles and loops through a list of sections that each contain a 
      title, description and any amount of clickable artciles or tutorials.
    */
    <div className="@flex @flex-col @w-full @items-center @justify-center">
      <div className="@flex @flex-col @space-y-2 @max-w-[90vw] @px-4 @pb-8 laptop:@py-2 laptop:@pb-12">
        <ThreeLinesText
          subtitle="You will finaly know what an airport is"
          title="How to play"
          text="Learn all the fundamentals here and climb the ladder!"
        />
        <div className="laptop:@px-8 @space-y-10">
          {data.map((section) => {
            return (
              <HowToPlaySection
                key={section.key}
                title={section.title}
                description={section.description}
                tailwind_color={section.color}
                articles={section.articles}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
