import Article from "frontend/components/layout/article/Article";
import type { ArticleData } from "frontend/utils/articleScript";
import { getArticleData, getArticleSlugs } from "frontend/utils/articleScript";
import type { GetStaticProps } from "next";

export function getStaticPaths() {
  const paths = getArticleSlugs("howtoplay");
  return {
    paths,
    fallback: false
  };
}

type Props = {
  postData: ArticleData;
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  if (typeof params?.id !== "string") {
    throw new Error("params id is not of type string");
  }

  const postData = await getArticleData("howtoplay", params.id);
  return {
    props: {
      postData
    }
  };
};

export default function HowToPlayArticle({ postData }: Props) {
  return (
    <>
    <Article postData={postData}/>
    </>
  );
}
