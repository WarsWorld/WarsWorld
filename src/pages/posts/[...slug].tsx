import Article from "frontend/components/layout/article/Article";
import { trpc } from "frontend/utils/trpc-client";
import type { InferGetStaticPropsType, GetStaticPaths, GetStaticPropsContext } from 'next';
import { useEffect, useState } from "react";
import { remark } from "remark";
import html from "remark-html";
import { prisma } from "server/prisma/prisma-client";

export const stringToSlug = (title: string) => title.replace(/\s/g, "-").replace(/[^\w\s-]/gi, '').toLowerCase();

export const getStaticPaths = (async () => {
  const articles = await prisma.post.findMany({
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
    const postId = context.params?.slug[0];
    const paramSlug = context.params?.slug[1];

    // If the url Id is invalid
    if(postId == undefined || !/^[0-9]+$/.test(postId)) {
      return {
        notFound: true,
      }
    }

    // Get article title to compare it with the one that's on the url
    const article = await prisma.post.findFirst({
      select: {
        title: true,
      },
      where: {
        id: parseInt(postId),
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
          destination: `/posts/${postId}/${title}`,
          permanent: false,
        },
      }
    }

    // Render the page
    return { 
      props: { 
        postId: postId,
        title: title,
      },
      revalidate: 10,
    }
});

export default function NewsArticle(
  { postId }: InferGetStaticPropsType<typeof getStaticProps>,
) {
  const { data: article } = trpc.post.getMarkdownById.useQuery({ id: postId }, { enabled: postId != undefined });
  const [post, setPost] = useState("");

  useEffect(() => {
    if(article) {
      const process = remark().use(html).processSync(article.body);
      setPost(process.toString());
    }
  }, [article]);

  return (
    <>
      { article && <Article postData={{
          type: article.type,
          contentHtml: post,
          metaData: {
            title: article.title,
            description: article.description,
            category: article.category,
            thumbnail: article.thumbnail ?? "",
            thumbnailAlt: article.title,
            createdAt: article.createdAt.toDateString(),
          }
        }}/>
      }
    </>
  );
}