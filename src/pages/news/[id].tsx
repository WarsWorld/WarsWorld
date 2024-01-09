import Article from "frontend/components/layout/article/Article";
import { trpc } from "frontend/utils/trpc-client";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { remark } from "remark";
import html from "remark-html";
export default function NewsArticle() {

  const { query } = useRouter();
  const id = query.id as string;

  const { data: article } = trpc.post.getMarkdownByIdAndType.useQuery({ id, type: "news" });

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