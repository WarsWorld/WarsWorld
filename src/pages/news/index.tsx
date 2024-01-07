/* eslint-disable @typescript-eslint/consistent-type-imports */
import PageTitle from "frontend/components/layout/PageTitle";
import { FeaturedNewsCard } from "frontend/components/news/FeaturedNewsCard";
import LinkCard, { ICardInfo }  from "frontend/components/layout/article/LinkCard";
import { ArticleMetaData, getSortedArticles } from "frontend/utils/articleScript";
import { trpc } from "frontend/utils/trpc-client";
import Head from "next/head";
import type { GetStaticProps, InferGetStaticPropsType } from "next";
import LinkCardContainer from "frontend/components/layout/article/LinkCardContainer";

/**
 * previous, the newsCardObjectList data and <LinkCard> component
 * were used to demo / design this page.
 * now i've added rudimentary backend integration that ignores
 * both. i only commented the <LinkCard> stuff out
 * so that the styling can be used again at some point.
 */

const newsCardsObjectList: ICardInfo[] = [
  {
    image: "/img/layout/newsPage/newsPlaceholder1.png",
    imageAlt: "News placeholderimage 1",
    title: "Blitz mode is active!",
    description: "Introducing Blitz Mode: faster battles, reduced turn timers. Available now!",
    date: "12-12-9999",
    category: "Patch",
    subdirectory: ""
  },
  {
    image: "/img/layout/newsPage/newsPlaceholder2.png",
    imageAlt: "News placeholderimage 2",
    title: "Clans are out!",
    description: "Join forces with friends in the new alliance system. Coordinate attacks, conquer together!",
    date: "12-12-9999",
    category: "Patch",
    subdirectory: ""
  },
  {
    image: "/img/layout/newsPage/newsPlaceholder3.png",
    imageAlt: "News placeholderimage 3",
    title: "Commander Challenge",
    description: "Test your skills in solo missions. Conquer challenges and earn exclusive rewards. Are you up for the challenge?",
    date: "12-12-9999",
    category: "Patch",
    subdirectory: ""
  },
  {
    image: "/img/layout/newsPage/newsPlaceholder4.png",
    imageAlt: "News placeholderimage 4",
    title: "Tournament Series",
    description: " Battle the best in intense multiplayer matches. Compete for the championship and incredible prizes. Register soon!",
    date: "12-12-9999",
    category: "Patch",
    subdirectory: ""
  },
  {
    image: "/img/layout/newsPage/newsPlaceholder1.png",
    imageAlt: "News placeholderimage 1",
    title: "Blitz mode is active!",
    description: "Introducing Blitz Mode: faster battles, reduced turn timers. Available now!",
    date: "12-12-9999",
    category: "Patch",
    subdirectory: ""
  },
  {
    image: "/img/layout/newsPage/newsPlaceholder2.png",
    imageAlt: "News placeholderimage 2",
    title: "Clans are out!",
    description: "Join forces with friends in the new alliance system. Coordinate attacks, conquer together!",
    date: "12-12-9999",
    category: "Patch",
    subdirectory: ""
  },
  {
    image: "/img/layout/newsPage/newsPlaceholder3.png",
    imageAlt: "News placeholderimage 3",
    title: "Commander Challenge",
    description: "Test your skills in solo missions. Conquer challenges and earn exclusive rewards. Are you up for the challenge?",
    date: "12-12-9999",
    category: "Patch",
    subdirectory: ""
  },
  {
    image: "/img/layout/newsPage/newsPlaceholder4.png",
    imageAlt: "News placeholderimage 4",
    title: "Tournament Series",
    description: " Battle the best in intense multiplayer matches. Compete for the championship and incredible prizes. Register soon!",
    date: "12-12-9999",
    category: "Patch",
    subdirectory: ""
  }
];

type Props = {
  articlesData?: ArticleMetaData;
};

export const getStaticProps: GetStaticProps<Props> = () => {
  const articlesData = getSortedArticles("news");
  return {
    props: {
      articlesData
    }
  };
};

export default function NewsPage({articlesData}: InferGetStaticPropsType<typeof getStaticProps>)  {
  const articles: ICardInfo[] = articlesData?.map((art) => ({...art.metaData, subdirectory: `news/${art.slug}`})) ?? []
  return (
    <>
      <Head>
        <title>News | Wars World</title>
      </Head>

      <div className="@w-full @mt-8">
        <PageTitle svgPathD="M160-120q-33 0-56.5-23.5T80-200v-640l67 67 66-67 67 67 67-67 66 67 67-67 67 67 66-67 67 67 67-67 66 67 67-67v640q0 33-23.5 56.5T800-120H160Zm0-80h280v-240H160v240Zm360 0h280v-80H520v80Zm0-160h280v-80H520v80ZM160-520h640v-120H160v120Z">News</PageTitle>
      </div>
      <div className="@w-full @overflow-hidden">
        <div className="@w-full @my-8">
          <FeaturedNewsCard cardInfo={articles[2]}/>
        </div>
      </div>
      <div className="@flex @flex-col @py-4 @gap-10 @w-[95vw] @justify-center @items-center @mb-10">
        <LinkCardContainer>
          {articles.map((article, index) => (
          <LinkCard key={index} cardInfo={article} />))}

          {/* {newsCardsObjectList.map((item, index) => {
            return <NewsCard key={index} cardInfo={item} />;
          })} */}
        </LinkCardContainer>
      </div>
    </>
  );
}
