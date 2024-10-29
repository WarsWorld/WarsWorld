import { createServerSideHelpers } from "@trpc/react-query/server";
import Article from "frontend/components/layout/article/Article";
import { markdownToHTML, stringToSlug } from "frontend/utils/articleUtils";
import { trpc } from "frontend/utils/trpc-client";
import type { GetStaticPaths, GetStaticPropsContext, InferGetStaticPropsType } from "next";
import { prisma } from "server/prisma/prisma-client";
import { appRouter } from "server/routers/app";
import superjson from "superjson";

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
    fallback: "blocking",
  };
}) satisfies GetStaticPaths;

export const getStaticProps = async (context: GetStaticPropsContext<{ slug: string[] }>) => {
  const articleId = context.params?.slug[0];
  const paramSlug = context.params?.slug[1];

  const isArticleIdInt = articleId == undefined || !/^[0-9]+$/.test(articleId);

  if (isArticleIdInt) {
    return {
      notFound: true,
    };
  }

  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { session: null },
    transformer: superjson,
  });

  const articleTitle = await helpers.article.getArticleTitleById.fetch({
    id: articleId,
  });

  if (articleTitle === undefined || articleTitle === null) {
    return {
      notFound: true,
    };
  }

  const title = stringToSlug(articleTitle);

  // Redirect to correct slug
  if (title != paramSlug || context.params?.slug[2] != undefined) {
    return {
      redirect: {
        destination: `/articles/${articleId}/${title}`,
        permanent: false,
      },
    };
  }

  await helpers.article.getArticleById.prefetch({
    id: articleId,
  });

  // Render the page
  return {
    props: {
      trpcState: helpers.dehydrate(),
      articleId: articleId,
    },
    revalidate: 60,
  };
};

export default function ArticlePage({ articleId }: InferGetStaticPropsType<typeof getStaticProps>) {
  const { data: articleData } = trpc.article.getArticleById.useQuery(
    { id: articleId },
    { enabled: articleId !== undefined, refetchOnMount: false, refetchOnWindowFocus: false },
  );
  const { data: articleComments } = trpc.article.getArticleCommentsById.useQuery(
    { id: articleId },
    { enabled: articleId !== undefined },
  );

  return (
    <>
      {articleData && articleComments && (
        <Article
          articleData={{
            type: articleData.type ?? "news",
            contentHtml: markdownToHTML(articleData.body),
            comments: articleComments,
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
