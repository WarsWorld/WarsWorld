import {
  getArticleData,
  getArticleIds,
} from "../../frontend/utils/articleScript";

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
  return (
    <>
      <h1>{postData && postData.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: postData && postData.contentHtml }} />
      <h2>test</h2>
    </>
  );
}
