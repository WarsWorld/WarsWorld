import LinkCard from "frontend/components/layout/article/LinkCard";
import LinkCardContainer from "frontend/components/layout/article/LinkCardContainer";
import PageTitle from "frontend/components/layout/PageTitle";
import { FeaturedNewsCard } from "frontend/components/news/FeaturedNewsCard";
import { stringToSlug } from "frontend/utils/articleUtils";
import { trpc } from "frontend/utils/trpc-client";
import Head from "next/head";

export default function NewsPage() {
  const { data: articleNews } = trpc.article.getMetadataByType.useQuery({ type: "news" });

  return (
    <>
      <Head>
        <title>News | Wars World</title>
      </Head>

      <div className="@flex @flex-col @justify-center @items-center @align-middle">
        <div className="@w-full @my-8">
          <PageTitle svg="News">News</PageTitle>
        </div>

        <div className="@w-full @h-full">
          {articleNews && (
            <FeaturedNewsCard
              cardInfo={{
                subdirectory: `articles/${articleNews?.[1].id}/${stringToSlug(
                  articleNews?.[1].title,
                )}`,
                title: articleNews?.[1].title,
                description: articleNews?.[1].description,
                thumbnail: articleNews?.[1].thumbnail ?? "",
                thumbnailAlt: articleNews?.[1].title,
                date: articleNews?.[1].createdAt.toDateString(),
                category:
                  articleNews?.[1].category[0].toUpperCase() + articleNews?.[1].category.slice(1),
              }}
            />
          )}
        </div>

        <div className="@flex @flex-col @py-4 @gap-10 @w-[95vw] @justify-center @items-center @my-10">
          <LinkCardContainer>
            {articleNews?.map((article, index) => (
              <LinkCard
                key={index}
                cardInfo={{
                  subdirectory: `articles/${article.id}/${stringToSlug(article.title)}`,
                  title: article.title,
                  description: article.description,
                  thumbnail: article.thumbnail ?? "",
                  thumbnailAlt: article.title,
                  date: article.createdAt.toDateString(),
                  category: article.category[0].toUpperCase() + article.category.slice(1),
                }}
              />
            ))}
          </LinkCardContainer>
        </div>
      </div>
    </>
  );
}
