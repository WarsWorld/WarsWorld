/* eslint-disable @typescript-eslint/consistent-type-imports */
import PageTitle from "frontend/components/layout/PageTitle";
import { FeaturedNewsCard } from "frontend/components/news/FeaturedNewsCard";
import NewsCard, { ICardInfo }  from "frontend/components/news/NewsCard";
import { ArticleMetaData, getSortedArticles } from "frontend/utils/articleScript";
import { trpc } from "frontend/utils/trpc-client";
import Head from "next/head";
import type { GetStaticProps, InferGetStaticPropsType } from "next";

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
    slug: "slug"
  },
  {
    image: "/img/layout/newsPage/newsPlaceholder2.png",
    imageAlt: "News placeholderimage 2",
    title: "Clans are out!",
    description: "Join forces with friends in the new alliance system. Coordinate attacks, conquer together!",
    date: "12-12-9999",
    category: "Patch",
    slug: "slug"
  },
  {
    image: "/img/layout/newsPage/newsPlaceholder3.png",
    imageAlt: "News placeholderimage 3",
    title: "Commander Challenge",
    description: "Test your skills in solo missions. Conquer challenges and earn exclusive rewards. Are you up for the challenge?",
    date: "12-12-9999",
    category: "Patch",
    slug: "slug"
  },
  {
    image: "/img/layout/newsPage/newsPlaceholder4.png",
    imageAlt: "News placeholderimage 4",
    title: "Tournament Series",
    description: " Battle the best in intense multiplayer matches. Compete for the championship and incredible prizes. Register soon!",
    date: "12-12-9999",
    category: "Patch",
    slug: "slug"
  },
  {
    image: "/img/layout/newsPage/newsPlaceholder1.png",
    imageAlt: "News placeholderimage 1",
    title: "Blitz mode is active!",
    description: "Introducing Blitz Mode: faster battles, reduced turn timers. Available now!",
    date: "12-12-9999",
    category: "Patch",
    slug: "slug"
  },
  {
    image: "/img/layout/newsPage/newsPlaceholder2.png",
    imageAlt: "News placeholderimage 2",
    title: "Clans are out!",
    description: "Join forces with friends in the new alliance system. Coordinate attacks, conquer together!",
    date: "12-12-9999",
    category: "Patch",
    slug: "slug"
  },
  {
    image: "/img/layout/newsPage/newsPlaceholder3.png",
    imageAlt: "News placeholderimage 3",
    title: "Commander Challenge",
    description: "Test your skills in solo missions. Conquer challenges and earn exclusive rewards. Are you up for the challenge?",
    date: "12-12-9999",
    category: "Patch",
    slug: "slug"
  },
  {
    image: "/img/layout/newsPage/newsPlaceholder4.png",
    imageAlt: "News placeholderimage 4",
    title: "Tournament Series",
    description: " Battle the best in intense multiplayer matches. Compete for the championship and incredible prizes. Register soon!",
    date: "12-12-9999",
    category: "Patch",
    slug: "slug"
  }
];

type Props = {
  articlesData?: ArticleMetaData;
};

export const getStaticProps: GetStaticProps<Props> = () => {
  const articlesData = getSortedArticles();
  return {
    props: {
      articlesData
    }
  };
};

export default function NewsPage({articlesData}: InferGetStaticPropsType<typeof getStaticProps>)  {
  return (
    <>
      <Head>
        <title>News | Wars World</title>
      </Head>

      <div className="@w-full @mt-8">
        <PageTitle>News</PageTitle>
      </div>
      <div className="@flex @flex-col @p-5 @gap-10 @w-full @justify-center @items-center">
        <FeaturedNewsCard />
        <div className="@flex @flex-wrap @gap-8 @justify-center @items-center @max-w-[90vw] @mb-5">
          {articlesData?.map((post, index) => (<NewsCard 
          key={index} 
          cardInfo={
          {
            image: post.metaData.image,
            imageAlt: post.metaData.imageAlt,
            title: post.metaData.title,
            description: post.metaData.description,
            date: post.metaData.date,
            category: post.metaData.category,
            slug: post.slug    
          }
          } />))}

          {/* {newsCardsObjectList.map((item, index) => {
            return <NewsCard key={index} cardInfo={item} />;
          })} */}
        </div>
      </div>
    </>
  );
}
