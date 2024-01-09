/* eslint-disable @typescript-eslint/consistent-type-imports */
import PageTitle from "frontend/components/layout/PageTitle";
import { FeaturedNewsCard } from "frontend/components/news/FeaturedNewsCard";
import LinkCard  from "frontend/components/layout/article/LinkCard";
import { trpc } from "frontend/utils/trpc-client";
import Head from "next/head";
import LinkCardContainer from "frontend/components/layout/article/LinkCardContainer";
export default function NewsPage()  {
  const { data: articleNews } = trpc.post.getMetadataByType.useQuery({ type: "news" });

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
          {
            articleNews && 
            <FeaturedNewsCard cardInfo={{
              subdirectory: `news/${articleNews?.[1].id}`,
              title: articleNews?.[1].title,
              description: articleNews?.[1].description,
              thumbnail: articleNews?.[1].thumbnail ?? "",
              thumbnailAlt: articleNews?.[1].title,
              date: articleNews?.[1].createdAt.toDateString(),
              category: articleNews?.[1].category[0].toUpperCase() + articleNews?.[1].category.slice(1),
            }}/>
          }
        </div>
      </div>
      <div className="@flex @flex-col @py-4 @gap-10 @w-[95vw] @justify-center @items-center @mb-10">
        <LinkCardContainer>
          {articleNews?.map((article, index) => (
          <LinkCard key={index} cardInfo={{
            subdirectory: `news/${article.id}`,
            title: article.title,
            description: article.description,
            thumbnail: article.thumbnail ?? "",
            thumbnailAlt: article.title,
            date: article.createdAt.toDateString(),
            category: article.category[0].toUpperCase() + article.category.slice(1),
          }} />))}
        </LinkCardContainer>
      </div>
    </>
  );
}
