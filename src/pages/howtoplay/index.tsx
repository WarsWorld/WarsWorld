import PageTitle from "frontend/components/layout/PageTitle";
import ArticleGroup from "frontend/components/layout/article/ArticleGroup";
import ThreeLinesText from "frontend/components/layout/ThreeLinesText";
import Head from "next/head";
import type { GetStaticProps, InferGetStaticPropsType } from "next";
import { ArticleMetaData, getSortedArticles } from "frontend/utils/articleScript";
import { ICardInfo } from "frontend/components/layout/article/LinkCard";

const data = [
  {
    title: "Basics",
    description:
      "If you are a new player, these guides will help you establish the basic fundamentals of the game",
    color: "@bg-green-500",
    // These articles are now longer being used. They have been turned into markdown files in src/frontend/utils/articles/howtoplay
    // articles: [
    //   {
    //     title: "Master the Basics",
    //     description: "Learn about unit types, terrain effects, and the turn-based gameplay.",
    //     image: "/img/HowToPlay/pic1.jpg",
    //     imageAlt: "Master the Basics",
    //     subdirectory: ""
    //   },
    //   {
    //     title: "Resource Management",
    //     description: "Understand how to efficiently produce units and manage funds.",
    //     image: "/img/HowToPlay/pic2.jpg",
    //     imageAlt: "Resource Management",
    //     subdirectory: ""
    //   },
    //   {
    //     title: "Map Awareness",
    //     description: "Study the map to identify chokepoints, advantageous positions, and key objectives.",
    //     image: "/img/HowToPlay/pic3.jpg",
    //     imageAlt: "Map Awareness",
    //     subdirectory: ""
    //   },
    //   {
    //     title: "Fog of War",
    //     description: "Learn to adapt to limited visibility and use recon units effectively.",
    //     image: "/img/HowToPlay/pic4.jpg",
    //     imageAlt: "Fog of War",
    //     subdirectory: ""
    //   },
    //   {
    //     title: "Fog of War 2",
    //     description: "Learn to adapt to limited visibility and use recon units effectively.",
    //     image: "/img/HowToPlay/pic4.jpg",
    //     imageAlt: "Fog of War",
    //     subdirectory: ""
    //   },
    // ],
  },
  {
    title: "Matches",
    description: "You can learn here how you can create or join a match.",
    // articles: [
    //   {
    //     title: "Create or join a match",
    //     description: "Learn how to create public or privates matches or join them.",
    //     image: "/img/HowToPlay/pic9.jpg",
    //     imageAlt: "Create or join a match",
    //     subdirectory: ""
    //   },
    //   {
    //     title: "Enter the Global League",
    //     description: "Intimidated by the Global League? Here we'll talk about everything you need to know.",
    //     image: "/img/HowToPlay/pic8.jpg",
    //     imageAlt: "Enter the Global League",
    //     subdirectory: ""
    //   },
    //   {
    //     title: "Play in a tournament",
    //     description: "Do you want to join a tournament? Here we'll explain the rules.",
    //     image: "/img/HowToPlay/pic7.jpg",
    //     imageAlt: "Play in a tournament",
    //     subdirectory: ""
    //   },
    // ],
  },
  {
    title: "Advance",
    description:
      "These guides will cover more advanced techniques with specific uses that can give you the edge on the battlefield.",
    color: "@bg-orange-500",
    // articles: [
    //   {
    //     title: "Indirect Units",
    //     description: "Learn how to use indirect units properly.",
    //     image: "/img/HowToPlay/pic5.jpg",
    //     imageAlt: "Indirect Units",
    //     subdirectory: ""
    //   },
    //   {
    //     title: "Tech-ups",
    //     description: "What's a tech-up and how to do it properly? Here we'll answer those questions.",
    //     image: "/img/HowToPlay/pic6.jpg",
    //     imageAlt: "Tech-ups",
    //     subdirectory: ""
    //   },
    // ],
  },
];

type Props = {
  articlesData?: ArticleMetaData;
};

export const getStaticProps: GetStaticProps<Props> = () => {
  const articlesData = getSortedArticles("howtoplay");
  return {
    props: {
      articlesData
    }
  };
};

export default function HowToPlay({articlesData}: InferGetStaticPropsType<typeof getStaticProps>) {
  const articles: ICardInfo[] = articlesData?.map((art) => ({...art.metaData, subdirectory: `howtoplay/${art.slug}`})) ?? []
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

      <div className="@flex @flex-col @max-w-[95vw] @px-4 @pb-8 laptop:@pb-12">
        <ThreeLinesText
          subtitle="You will finaly know what an airport is"
          title=""
          text="Learn all the fundamentals here and climb the ladder!"
        />
        <div className="@flex @flex-col @gap-8 @my-2 smallscreen:@my-10">
          {data.map((section, index) => {
            return (
              <ArticleGroup
                key={index}
                title={section.title}
                description={section.description}
                tailwind_color={section.color}
                articles={articles.filter((article) => article.category?.toLowerCase() == section.title.toLowerCase())}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
