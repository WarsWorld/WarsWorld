import type { ArticleData } from "frontend/utils/articleScript";
import { getArticleData, getArticleSlugs } from "frontend/utils/articleScript";
import Banner from "frontend/components/layout/Banner";
import styles from "frontend/styles/pages/articles.module.scss";
import type { GetStaticProps } from "next";
import Head from "next/head";

export function getStaticPaths() {
  const paths = getArticleSlugs();
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

  const postData = await getArticleData(params.id);
  return {
    props: {
      postData
    }
  };
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

    return (
      <>
        <Head>
          <title>{postData.metaData.title}</title>
          <meta name="description" content={postData.metaData.description}/>
        </Head>

        <Banner
          title={
            <div>
              {/* <h2 className="@bg-secondary @inline-block @p-2 @text-black @font-[500]">
                {postData.metaData.type.toUpperCase()}
                Type here
              </h2> */}
              <h2 className="@bg-white @inline-block @p-2 @text-black @font-[500]">
                {postData.metaData.category.toUpperCase()}
              </h2>
              <h1>{postData.metaData.title}</h1>
              <p>{postData.metaData.description}</p>
            </div>
          }
          backgroundURL={postData.metaData.image}
        />

        <div
          className={
            "@grid @grid-cols-12 smallscreen:@p-10 smallscreen:@gap-10 @gap-2 @relative @leading-10 "
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
