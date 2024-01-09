import { type ArticleType } from "@prisma/client";
import Banner from "frontend/components/layout/Banner";
import styles from "frontend/styles/pages/articles.module.scss";
import Head from "next/head";

type Props = {
  postData: {
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
  }
};

export default function Article({ postData }: Props) {
  // Lets make sure we have our parameters/data
  // before loading so we dont cause any errors
  if (typeof postData === "undefined") {
    return <h1>Loading...</h1>;
  } else {
    // Get headers for index table
    let theHTML = postData.contentHtml;
    const headers = [...theHTML.matchAll(/<h1+>(.*?)<\/h1*>/gm)];

    // Put IDs on headers so /articleName#header links to the header
    for (const header of headers) {
      theHTML = theHTML.replace(
        /<h1>/,
        `<h1 id="${header[1].replace(/\s/g, "-")}">`
      );
    }
    
    // List styling
    theHTML = theHTML.replaceAll(
      /<li>/g,
      `<li class="@ml-5">`
    );
    theHTML = theHTML.replaceAll(
      /<ol>/g,
      `<ol class="@list-decimal">`
    );
    theHTML = theHTML.replaceAll(
      /<ul>/g,
      `<ul class="@list-disc">`
    );

    return (
      <>
        <Head>
          <title>{`${postData.type[0].toUpperCase() + postData.type.slice(1)} | ${postData.metaData.title}`}</title>
          <meta name="description" content={postData.metaData.description}/>
        </Head>

        <Banner
          title={
            <div>
              <h2 className="@bg-bg-secondary @inline-block @py-2 @px-4 smallscreen:@py-4 smallscreen:@px-6 @text-xl smallscreen:@text-5xl @text-white @font-medium">
                {postData.type.toUpperCase()}
              </h2>
              <h2 className="@bg-white @inline-block @py-2 @px-4 smallscreen:@py-4 smallscreen:@px-6 @text-xl smallscreen:@text-5xl @text-black @font-medium">
                {postData.metaData.category.toUpperCase()}
              </h2>
              <h1 className="@text-2xl smallscreen:@text-6xl large_monitor:@text-8xl @font-semibold @my-6">{postData.metaData.title}</h1>
              <h1 className="@text-lg smallscreen:@text-3xl large_monitor:@text-6xl">{postData.metaData.description}</h1>
            </div>
          }
          backgroundURL={postData.metaData.thumbnail}
        />

        <div
          className={
            "@grid @grid-cols-12 @p-6 smallscreen:@p-10 smallscreen:@gap-10 @gap-2 @relative @leading-10 "
          }
        >
          <div
            className={`@col-span-12 smallscreen:@col-span-10 @bg-bg-tertiary smallscreen:@p-10 @p-2 @rounded-2xl ${styles.articleGrid} @list-disc [&>p]:inline`}
            dangerouslySetInnerHTML={{ __html: theHTML }}
          />

          <div
            className={
              " smallscreen:@col-span-2 @col-span-12 @bg-bg-tertiary  @p-3 @sticky @top-[10vw] @h-max @rounded-2xl "
            }
          >
            <p>INDEX</p>
            {headers.map((item) => {
              return (
                <a
                  key={item[1]}
                  href={`#${item[1].replace(/\s/g, "-")}`}
                  className={"@text-white @block @py-4"}
                >
                  {item[1]}
                </a>
              );
            })}
          </div>
        </div>
      </>
    );
  }
}
