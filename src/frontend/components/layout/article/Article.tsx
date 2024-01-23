
import Banner from "frontend/components/layout/Banner";
import Head from "next/head";
import ArticleContent from "./ArticleContent";
import type { ArticleCommentsWithPlayer, ArticleType } from "shared/schemas/article";
import ArticleCommentSection from "./ArticleCommentSection";

type Props = {
  articleData: {
    type: ArticleType;
    contentHtml: string;
    metaData: {
        title: string;
        description: string;
        createdAt: string;
        category: string;
        thumbnail: string;
        thumbnailAlt: string;
    };
    comments: ArticleCommentsWithPlayer;
  }
};

export default function Article({ articleData }: Props) {
  // Lets make sure we have our parameters/data
  // before loading so we dont cause any errors
  if (typeof articleData === "undefined") {
    return <h1>Loading...</h1>;
  } else {
    // Get headers for index table

    return (
      <>
        <Head>
          <title>{`${articleData.type[0].toUpperCase() + articleData.type.slice(1)} | ${articleData.metaData.title}`}</title>
          <meta name="description" content={articleData.metaData.description}/>
        </Head>

        <Banner
          title={
            <div>
              <h2 className="@bg-bg-secondary @inline-block @py-2 @px-4 smallscreen:@py-4 smallscreen:@px-6 @text-xl smallscreen:@text-5xl @text-white @font-medium">
                {articleData.type.toUpperCase()}
              </h2>
              <h2 className="@bg-white @inline-block @py-2 @px-4 smallscreen:@py-4 smallscreen:@px-6 @text-xl smallscreen:@text-5xl @text-black @font-medium">
                {articleData.metaData.category.toUpperCase()}
              </h2>
              <h1 className="@text-2xl smallscreen:@text-6xl large_monitor:@text-8xl @font-semibold @my-6 smallscreen:@pr-12">{articleData.metaData.title}</h1>
              <h1 className="@text-lg smallscreen:@text-3xl large_monitor:@text-6xl smallscreen:@pr-12">{articleData.metaData.description}</h1>
            </div>
          }
          backgroundURL={articleData.metaData.thumbnail}
        />
        
        <ArticleContent contentHTML={articleData.contentHtml} />
        
        <ArticleCommentSection comments={articleData.comments} />
      </>
    );
  }
}
