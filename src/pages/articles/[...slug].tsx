import Article from "frontend/components/layout/article/Article";
import { trpc } from "frontend/utils/trpc-client";
import type { GetServerSideProps } from 'next';
import { remark } from "remark";
import html from "remark-html";
import { prisma } from "server/prisma/prisma-client";
import { ArticleType } from "shared/schemas/article";

type Props = { 
  articleId: string,
  title: string,
};

export const stringToSlug = (title: string) => title.replace(/\s/g, "-").replace(/[^\w\s-]/gi, '').toLowerCase();

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

  const process = remark().use(html).processSync(articleData?.body);
  const articleBody = process.toString();

  return (
    <>
      { articleData && <Article articleData={{
          type: articleData.type as ArticleType,
          contentHtml: articleBody,
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