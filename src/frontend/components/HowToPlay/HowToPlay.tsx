import HowToPlaySection from "./HowToPlaySection";

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
    <div className="@flex @flex-col @w-full @items-center @justify-center">
      <div className="@flex @flex-col @space-y-2 @max-w-[90vw] @px-4 @pb-8 laptop:@py-2 laptop:@pb-12">
        <div className="@flex @flex-col @justify-center @items-center @my-2 laptop:@my-8 @space-y-4">
          <h3>You will finaly know what an airport is</h3>
          <h1 className="@font-bold">How to play</h1>
          <h2>Learn all the fundamentals here and climb the ladder!</h2>
        </div>
        <div className="laptop:@px-8 @space-y-10">
          {data.map((section) => {
            return (
              <HowToPlaySection
                key={section.key}
                title={section.title}
                description={section.description}
                color={section.color}
                articles={section.articles}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
