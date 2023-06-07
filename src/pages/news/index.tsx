import { FeaturedNews } from "frontend/components/news/FeaturedNews";
import LinkCard from "frontend/components/layout/LinkCard";
import Head from "next/head";
import { v4 as uuidv4 } from "uuid";
import { ICardInfo } from "frontend/components/layout/LinkCard";

const newsCardsObjectList: ICardInfo[] = [
  {
    imgSrc: "/img/layout/newsPage/newsPlaceholder1.png",
    imgAlt: "News placeholderimage 1",
    imgWidth: 300,
    imgHeight: 300,
    heading: "Blitz mode is active!",
    text: "Introducing Blitz Mode: faster battles, reduced turn timers. Available now!",
    link: "/",
  },
  {
    imgSrc: "/img/layout/newsPage/newsPlaceholder2.png",
    imgAlt: "News placeholderimage 2",
    imgWidth: 300,
    imgHeight: 300,
    heading: "Clans are out!",
    text: "Join forces with friends in the new alliance system. Coordinate attacks, conquer together!",
    link: "/",
  },
  {
    imgSrc: "/img/layout/newsPage/newsPlaceholder3.png",
    imgAlt: "News placeholderimage 3",
    imgWidth: 300,
    imgHeight: 300,
    heading: "Commander Challenge",
    text: "Test your skills in solo missions. Conquer challenges and earn exclusive rewards. Are you up for the challenge?",
    link: "/",
  },
  {
    imgSrc: "/img/layout/newsPage/newsPlaceholder4.png",
    imgAlt: "News placeholderimage 4",
    imgWidth: 300,
    imgHeight: 300,
    heading: "Tournament Series",
    text: " Battle the best in intense multiplayer matches. Compete for the championship and incredible prizes. Register soon!",
    link: "/",
  },
  {
    imgSrc: "/img/layout/newsPage/newsPlaceholder1.png",
    imgAlt: "News placeholderimage 1",
    imgWidth: 300,
    imgHeight: 300,
    heading: "Blitz mode is active!",
    text: "Introducing Blitz Mode: faster battles, reduced turn timers. Available now!",
    link: "/",
  },
  {
    imgSrc: "/img/layout/newsPage/newsPlaceholder2.png",
    imgAlt: "News placeholderimage 2",
    imgWidth: 300,
    imgHeight: 300,
    heading: "Clans are out!",
    text: "Join forces with friends in the new alliance system. Coordinate attacks, conquer together!",
    link: "/",
  },
  {
    imgSrc: "/img/layout/newsPage/newsPlaceholder3.png",
    imgAlt: "News placeholderimage 3",
    imgWidth: 300,
    imgHeight: 300,
    heading: "Commander Challenge",
    text: "Test your skills in solo missions. Conquer challenges and earn exclusive rewards. Are you up for the challenge?",
    link: "/",
  },
  {
    imgSrc: "/img/layout/newsPage/newsPlaceholder4.png",
    imgAlt: "News placeholderimage 4",
    imgWidth: 300,
    imgHeight: 300,
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

      <div className="@flex @flex-col tablet:@p-5 @gap-10 @h-full @w-full @justify-center @items-center">
        <div className="@flex @flex-col @h-full @items-center @gap-2 @max-w-[90vw] @mt-5">
          <h1>News</h1>
          <h3>Latest</h3>
        </div>
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
