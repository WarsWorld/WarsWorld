import Article from "frontend/components/layout/article/Article";
import { markdownToHTML, stringToSlug } from "frontend/utils/articleUtils";
import { trpc } from "frontend/utils/trpc-client";
import type { GetServerSideProps } from 'next';
import { prisma } from "server/prisma/prisma-client";

type Props = { 
  articleId: string,
  title: string,
};

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
    // These params are the ones you put on the url
    const articleId = params?.slug?.[0];
    const paramSlug = params?.slug?.[1];

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
    if(title != paramSlug || params?.slug?.[2] != undefined) {
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
    }
};

export default function NewsArticle(
  { articleId }: Props,
) {
  const { data: articleData } = trpc.article.getMarkdownById.useQuery({ id: articleId }, { enabled: articleId != undefined });

  return (
    <>
      { articleData && <Article articleData={{
          type: articleData.type,
          contentHtml: markdownToHTML(articleData.body),
          comments: articleData.Comments,
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