import {
  getArticleData,
  getArticleIds,
} from "../../frontend/utils/articleScript";
import Banner from "../../frontend/components/layout/Banner";
import styles from "../../frontend/styles/pages/articles.module.scss"

export async function getStaticPaths() {
  const paths = getArticleIds();
  return {
    paths,
    fallback: false,
  };
}

// @ts-ignore
export async function getStaticProps({ params }) {
  const postData = await getArticleData(params.id);
  return {
    props: {
      postData,
    },
  };
}

// @ts-ignore
export default function Articles({ postData }) {
  function logStuff(stuff: any) {
    console.log(stuff);
  }
  // eslint-disable-next-line max-len
  //Lets make sure we have our parameters before loading the page and causing errors
  if (typeof postData === "undefined") return <h1>Loading...</h1>;
  else {
    //Get headers for index table
    let theHTML: any = postData.contentHtml;
    const headers = [...theHTML.matchAll(/<h1+>(.*?)<\/h1*>/gm)];
    //Put IDs on headers so /article#header links to the header
    for (let i = 0; i < headers.length; i++) {
      theHTML = theHTML.replace(
        /<h1>/,
        `<h1 id="${headers[i][1].replace(/\s/g, "-")}">`
      );
    }

    // (?s)(?<=<h1>)(.+?)(?=</h1>)
    return (
      <>
        <Banner
          title={
            <div>
              <h2 className="@bg-secondary @inline-block @p-2 @text-black @font-[500]">
                {postData.type.toUpperCase()}
              </h2>
              <h2 className="@bg-white @inline-block @p-2 @text-black @font-[500]">
                {postData.category.toUpperCase()}
              </h2>
              <h1>{postData.title}</h1>
              <p>{postData.subtitle}</p>
            </div>
          }
          backgroundURL={postData.image}
        />



        <div className={"@grid @grid-cols-12 smallscreen:@p-10 smallscreen:@gap-10 @gap-2 @relative @leading-10 "}>


          <div
            className={`@col-span-12 smallscreen:@col-span-10 @bg-bg-tertiary smallscreen:@p-10 @p-2 @rounded-2xl ${styles.articleGrid} ` }
            dangerouslySetInnerHTML={{ __html: theHTML }}
          />


            <div className={" smallscreen:@col-span-2 @col-span-12 @bg-bg-tertiary  @p-3 @sticky @top-[10vw] @h-max @rounded-2xl "}>
              <p>INDEX</p>
              {headers.map((item) => {
                return (

                  <a
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
