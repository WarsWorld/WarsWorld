import PageTitle from "frontend/components/layout/PageTitle";
import HowToPlaySection from "frontend/components/layout/ArticleSection";
import ThreeLinesText from "frontend/components/layout/ThreeLinesText";
import Head from "next/head";

export default function Howtoplay() {
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
          imgSrc: "/img/HowToPlay/pic1.jpg",
          imgAlt: "Master the Basics",
          link: "/",
        },
        {
          key: "t2",
          heading: "Resource Management",
          text: "Understand how to efficiently produce units and manage funds.",
          imgSrc: "/img/HowToPlay/pic2.jpg",
          imgAlt: "Resource Management",
          link: "/",
        },
        {
          key: "t3",
          heading: "Map Awareness",
          text: "Study the map to identify chokepoints, advantageous positions, and key objectives.",
          imgSrc: "/img/HowToPlay/pic3.jpg",
          imgAlt: "Map Awareness",
          link: "/",
        },
        {
          key: "t4",
          heading: "Fog of War",
          text: "Learn to adapt to limited visibility and use recon units effectively.",
          imgSrc: "/img/HowToPlay/pic4.jpg",
          imgAlt: "Fog of War",
          link: "/",
        },
        {
          key: "t21",
          heading: "Fog of War 2",
          text: "Learn to adapt to limited visibility and use recon units effectively.",
          imgSrc: "/img/HowToPlay/pic4.jpg",
          imgAlt: "Fog of War",
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
          imgSrc: "/img/HowToPlay/pic9.jpg",
          imgAlt: "Create or join a match",
          link: "/",
        },
        {
          key: "t2",
          heading: "Enter the Global League",
          text: "Intimidated by the Global League? Here we'll talk about everything you need to know.",
          imgSrc: "/img/HowToPlay/pic8.jpg",
          imgAlt: "Enter the Global League",
          link: "/",
        },
        {
          key: "t3",
          heading: "Play in a tournament",
          text: "Do you want to join a tournament? Here we'll explain the rules.",
          imgSrc: "/img/HowToPlay/pic7.jpg",
          imgAlt: "Play in a tournament",
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
          imgSrc: "/img/HowToPlay/pic5.jpg",
          imgAlt: "Indirect Units",
          link: "/",
        },
        {
          key: "t6",
          heading: "Tech-ups",
          text: "What's a tech-up and how to do it properly? Here we'll answer those questions.",
          imgSrc: "/img/HowToPlay/pic6.jpg",
          imgAlt: "Tech-ups",
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
    <>
      <Head>
        <title>Wars World Guides</title>
      </Head>

      <div className="@w-full @mt-8">
        <PageTitle>How to Play</PageTitle>
      </div>

      <div className="@flex @flex-col @max-w-[90vw] @px-4 @pb-8 laptop:@pb-12">
        <ThreeLinesText
          subtitle="You will finaly know what an airport is"
          title=""
          text="Learn all the fundamentals here and climb the ladder!"
        />
        <div className="@flex @flex-col @gap-8 @my-2 smallscreen:@my-10">
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
    </>
  );
}
