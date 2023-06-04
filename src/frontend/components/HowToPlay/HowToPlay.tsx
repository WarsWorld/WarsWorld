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
          heading: "Focus on capturing properties",
          text: "Capturing properties is essential to building up your economy and producing more units.",
          image: "/img/HowToPlay/pic1.jpg",
          link: "/",
        },
        {
          key: "t2",
          heading: "Keep an eye on your opponent's units",
          text: "It's important to be aware of what your opponent is doing and where their units are located.",
          image: "/img/HowToPlay/pic2.jpg",
          link: "/",
        },
        {
          key: "t3",
          heading: "Use terrain to your advantage",
          text: "Terrain can be a powerful tool in Advance Wars.",
          image: "/img/HowToPlay/pic3.jpg",
          link: "/",
        },
        {
          key: "t4",
          heading: "Build a balanced army",
          text: "You'll want to have a mix of different units to be able to deal with different types of enemy units.",
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
          heading: "Plan ahead",
          text: "Advance Wars is a game that requires planning and foresight.",
          image: "/img/HowToPlay/pic5.jpg",
          link: "/",
        },
        {
          key: "t6",
          heading: "Communicate with your teammate",
          text: "If you're playing a multiplayer game with teammates, communication is the key.",
          image: "/img/HowToPlay/pic6.jpg",
          link: "/",
        },
      ],
    },
  ];

  return (
    <div className="@flex @flex-col @w-full @items-center @justify-center">
      <div className="@flex @flex-col @space-y-2 @max-w-[90vw] @px-4 laptop:@py-2 laptop:@pb-12">
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
