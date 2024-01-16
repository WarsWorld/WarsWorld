import Article from "frontend/components/layout/article/Article";
import { trpc } from "frontend/utils/trpc-client";
import type { InferGetStaticPropsType, GetStaticPaths, GetStaticPropsContext } from 'next';
import { useEffect, useState } from "react";
import { remark } from "remark";
import html from "remark-html";
import { prisma } from "server/prisma/prisma-client";
import { ArticleType } from "shared/schemas/article";

export const stringToSlug = (title: string) => title.replace(/\s/g, "-").replace(/[^\w\s-]/gi, '').toLowerCase();

export const getStaticPaths = (async () => {
  const articles = await prisma.article.findMany({
    select: {
      id: true,
      title: true,
    }
  })

  const paths = articles?.map(article => {
    return {
      params: {
        slug: [article.id.toString(), stringToSlug(article.title)],
      },
    }
  })
  
  return {
    paths: paths ?? [],
    fallback: "blocking",
  }
}) satisfies GetStaticPaths;

export const getStaticProps = (
  async (context: GetStaticPropsContext<{ slug: string[] }>) => 
  {
    // These params are the ones you put on the url
    const articleId = context.params?.slug[0];
    const paramSlug = context.params?.slug[1];

    // If the url Id is invalid
    if(articleId == undefined || !/^[0-9]+$/.test(articleId)) {
      return {
        notFound: true,
      }
    }

    // Get article title to compare it with the one that's on the url
    const article = await prisma.article.findFirst({
      select: {
        title: true,
      },
      where: {
        id: parseInt(articleId),
      }
    });

    // No article found
    if(article == undefined) {
      return {
        notFound: true,
      }
    }

    const title = stringToSlug(article.title);

    // If the slug is incorrect or there are more params 
    // Redirect to correct slug
    if(title != paramSlug || context.params?.slug[2] != undefined) {
      return {
        redirect: {
          destination: `/articles/${articleId}/${title}`,
          permanent: false,
        },
      }
    }

    // Render the page
    return { 
      props: { 
        articleId: articleId,
        title: title,
      },
      revalidate: 10,
    }
});

export default function NewsArticle(
  { articleId }: InferGetStaticPropsType<typeof getStaticProps>,
) {
  const { data: articleData } = trpc.article.getMarkdownById.useQuery({ id: articleId }, { enabled: articleId != undefined });
  const [articleBody, setArticleBody] = useState("");

  useEffect(() => {
    if(articleData) {
      const process = remark().use(html).processSync(articleData.body);
      setArticleBody(process.toString());
    }
  }, [articleData]);

  return (
    <>
      { articleData && <Article articleData={{
          type: articleData.type as ArticleType,
          contentHtml: articleBody,
          metaData: {
            title: articleData.title,
            description: articleData.description,
            category: articleData.category,
            thumbnail: articleData.thumbnail ?? "",
            thumbnailAlt: articleData.title,
            createdAt: articleData.createdAt.toDateString(),
          }
        }}/>
      }
    </>
  );
}