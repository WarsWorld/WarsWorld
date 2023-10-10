import { FeaturedNews } from "frontend/components/news/FeaturedNews";
import LinkCard from "frontend/components/layout/LinkCard";
import Head from "next/head";
import { v4 as uuidv4 } from "uuid";
import { ICardInfo } from "frontend/components/layout/LinkCard";
import PageTitle from "frontend/components/layout/PageTitle";

const newsCardsObjectList: ICardInfo[] = [
  {
    imgSrc: "/img/layout/newsPage/newsPlaceholder1.png",
    imgAlt: "News placeholderimage 1",
    heading: "Blitz mode is active!",
    text: "Introducing Blitz Mode: faster battles, reduced turn timers. Available now!",
    link: "/",
  },
  {
    imgSrc: "/img/layout/newsPage/newsPlaceholder2.png",
    imgAlt: "News placeholderimage 2",
    heading: "Clans are out!",
    text: "Join forces with friends in the new alliance system. Coordinate attacks, conquer together!",
    link: "/",
  },
  {
    imgSrc: "/img/layout/newsPage/newsPlaceholder3.png",
    imgAlt: "News placeholderimage 3",
    heading: "Commander Challenge",
    text: "Test your skills in solo missions. Conquer challenges and earn exclusive rewards. Are you up for the challenge?",
    link: "/",
  },
  {
    imgSrc: "/img/layout/newsPage/newsPlaceholder4.png",
    imgAlt: "News placeholderimage 4",
    heading: "Tournament Series",
    text: " Battle the best in intense multiplayer matches. Compete for the championship and incredible prizes. Register soon!",
    link: "/",
  },
  {
    imgSrc: "/img/layout/newsPage/newsPlaceholder1.png",
    imgAlt: "News placeholderimage 1",
    heading: "Blitz mode is active!",
    text: "Introducing Blitz Mode: faster battles, reduced turn timers. Available now!",
    link: "/",
  },
  {
    imgSrc: "/img/layout/newsPage/newsPlaceholder2.png",
    imgAlt: "News placeholderimage 2",
    heading: "Clans are out!",
    text: "Join forces with friends in the new alliance system. Coordinate attacks, conquer together!",
    link: "/",
  },
  {
    imgSrc: "/img/layout/newsPage/newsPlaceholder3.png",
    imgAlt: "News placeholderimage 3",
    heading: "Commander Challenge",
    text: "Test your skills in solo missions. Conquer challenges and earn exclusive rewards. Are you up for the challenge?",
    link: "/",
  },
  {
    imgSrc: "/img/layout/newsPage/newsPlaceholder4.png",
    imgAlt: "News placeholderimage 4",
    heading: "Tournament Series",
    text: " Battle the best in intense multiplayer matches. Compete for the championship and incredible prizes. Register soon!",
    link: "/",
  },
];

export default function NewsPage() {
  return (
    <>
      <Head>
        <title>News | Wars World</title>
      </Head>

      <div className="@w-full @mt-8">
        <PageTitle>News</PageTitle>
      </div>
      <div className="@flex @flex-col @p-5 @gap-10 @w-full @justify-center @items-center">
        <FeaturedNews />
        <div className="@flex @flex-wrap @gap-8 @justify-center @items-center @max-w-[90vw] @mb-5">
          {newsCardsObjectList.map((item) => {
            return <LinkCard key={uuidv4()} cardInfo={item} />;
          })}
        </div>
      </div>
    </>
  );
}
