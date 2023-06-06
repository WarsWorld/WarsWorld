import { FeaturedNews } from "frontend/components/news/FeaturedNews";
import { NewsCards } from "frontend/components/news/NewsCards";
import Head from "next/head";
import { v4 as uuidv4 } from "uuid";

export interface newsCardsObject {
  imgSrc: string;
  imgAlt: string;
  imgWidth: number;
  imgHeight: number;
  cardTitle: string;
  cardDescription: string;
}

const newsCardsObjectList: newsCardsObject[] = [
  {
    imgSrc: "/img/layout/newsPage/newsPlaceholder1.png",
    imgAlt: "News placeholderimage 1",
    imgWidth: 300,
    imgHeight: 300,
    cardTitle: "Blitz mode is active!",
    cardDescription:
      "Introducing Blitz Mode: faster battles, reduced turn timers. Available now!",
  },
  {
    imgSrc: "/img/layout/newsPage/newsPlaceholder2.png",
    imgAlt: "News placeholderimage 2",
    imgWidth: 300,
    imgHeight: 300,
    cardTitle: "Clans are out!",
    cardDescription:
      "Join forces with friends in the new alliance system. Coordinate attacks, conquer together!",
  },
  {
    imgSrc: "/img/layout/newsPage/newsPlaceholder3.png",
    imgAlt: "News placeholderimage 3",
    imgWidth: 300,
    imgHeight: 300,
    cardTitle: "Commander Challenge",
    cardDescription:
      "Test your skills in solo missions. Conquer challenges and earn exclusive rewards. Are you up for the challenge?",
  },
  {
    imgSrc: "/img/layout/newsPage/newsPlaceholder4.png",
    imgAlt: "News placeholderimage 4",
    imgWidth: 300,
    imgHeight: 300,
    cardTitle: "Tournament Series",
    cardDescription:
      " Battle the best in intense multiplayer matches. Compete for the championship and incredible prizes. Register soon!",
  },
  {
    imgSrc: "/img/layout/newsPage/newsPlaceholder1.png",
    imgAlt: "News placeholderimage 1",
    imgWidth: 300,
    imgHeight: 300,
    cardTitle: "Blitz mode is active!",
    cardDescription:
      "Introducing Blitz Mode: faster battles, reduced turn timers. Available now!",
  },
  {
    imgSrc: "/img/layout/newsPage/newsPlaceholder2.png",
    imgAlt: "News placeholderimage 2",
    imgWidth: 300,
    imgHeight: 300,
    cardTitle: "Clans are out!",
    cardDescription:
      "Join forces with friends in the new alliance system. Coordinate attacks, conquer together!",
  },
  {
    imgSrc: "/img/layout/newsPage/newsPlaceholder3.png",
    imgAlt: "News placeholderimage 3",
    imgWidth: 300,
    imgHeight: 300,
    cardTitle: "Commander Challenge",
    cardDescription:
      "Test your skills in solo missions. Conquer challenges and earn exclusive rewards. Are you up for the challenge?",
  },
  {
    imgSrc: "/img/layout/newsPage/newsPlaceholder4.png",
    imgAlt: "News placeholderimage 4",
    imgWidth: 300,
    imgHeight: 300,
    cardTitle: "Tournament Series",
    cardDescription:
      " Battle the best in intense multiplayer matches. Compete for the championship and incredible prizes. Register soon!",
  },
];

export default function NewsPage() {
  return (
    <>
      <Head>
        <title>News | Wars World</title>
      </Head>

      <div className="@flex @flex-col tablet:@p-5 @gap-10 @h-full @w-full @justify-center @items-center">
        <div className="@flex @flex-col @h-full @items-center @gap-2 @mt-5">
          <h1>News</h1>
          <h3>Latest</h3>
        </div>
        <FeaturedNews />
        <div className="@flex @flex-wrap @gap-8 @justify-center @items-center @w-full @mb-5">
          {newsCardsObjectList.map((item) => {
            return <NewsCards key={uuidv4()} newsCardInfo={item} />;
          })}
        </div>
      </div>
    </>
  );
}
