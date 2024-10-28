import Article from "frontend/components/layout/article/Article";
import { markdownToHTML, stringToSlug } from "frontend/utils/articleUtils";
import { trpc } from "frontend/utils/trpc-client";
import type { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { prisma } from "server/prisma/prisma-client";

export const getStaticPaths = (async () => {
  const articles = await prisma.article.findMany({
    select: {
      id: true,
      title: true,
    },
  });
  const paths = articles?.map((article) => {
    return {
      params: {
        slug: [article.id.toString(), stringToSlug(article.title)],
      },
    };
  });

  return {
    paths: paths ?? [],
    fallback: true,
  };
}) satisfies GetStaticPaths;

export const getStaticProps = async (context: GetStaticPropsContext<{ slug: string[] }>) => {
  // Url Params
  const articleId = context.params?.slug[0];
  const paramSlug = context.params?.slug[1];

  const isArticleIdInt = articleId == undefined || !/^[0-9]+$/.test(articleId);

  if (isArticleIdInt) {
    return {
      notFound: true,
    };
  }
  // Get article title name
  const article = await prisma.article.findFirst({
    select: {
      title: true,
    },
    where: {
      id: parseInt(articleId),
    },
  });

  if (article == undefined) {
    return {
      notFound: true,
    };
  }
  const title = stringToSlug(article.title);
  // Redirect to correct slug
  if (title != paramSlug || context.params?.slug[2] != undefined) {
    return {
      redirect: {
        destination: `/articles/${articleId}/${title}`,
        permanent: false,
      },
    };
  }
  // Render the page
  return {
    props: {
      articleId: articleId ?? "",
      title: title,
    },
    revalidate: 60,
  };
};

export default function ArticlePage({ articleId }: InferGetStaticPropsType<typeof getStaticProps>) {
  const { data: articleData } = trpc.article.getMarkdownById.useQuery(
    { id: articleId },
    { enabled: articleId != undefined },
  );

  return (
    <>
      {articleData && (
        <Article
          articleData={{
            type: articleData.type ?? "news",
            contentHtml: markdownToHTML(articleData.body),
            comments: articleData.Comments,
            metaData: {
              title: articleData.title,
              description: articleData.description,
              category: articleData.category,
              thumbnail: articleData.thumbnail ?? "",
              thumbnailAlt: articleData.title,
              createdAt: articleData.createdAt.toDateString(),
            },
          }}
        />
      )}
    </>
  );
}
