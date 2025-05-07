import { ProtectPage } from "frontend/components/auth/ProtectPage";
import ArticleContent from "frontend/components/layout/article/ArticleContent";
import CreateArticleForm from "frontend/components/layout/article/CreateArticleForm";
import PageTitle from "frontend/components/layout/PageTitle";
import { markdownToHTML } from "frontend/utils/articleUtils";
import Head from "next/head";
import { useState } from "react";

export default function Create() {
  const [articleData, setArticleData] = useState({
    title: "",
    description: "",
    thumbnail: "",
    body: "",
    category: "patch",
  });

  return (
    <ProtectPage>
      <Head>
        <title>Create Article | Wars World</title>
      </Head>

      <div className="@flex @flex-col @justify-center @items-center @align-middle">
        <div className="@my-8 @w-full">
          <PageTitle svg="AddFile">Create Article</PageTitle>
        </div>

        <div className="@w-full">
          <CreateArticleForm articleData={articleData} setArticleData={setArticleData} />
          <div className="@mt-8 @w-full">
            <PageTitle svg="Eye">Preview</PageTitle>
          </div>

          <ArticleContent contentHTML={markdownToHTML(articleData.body)} />
        </div>
      </div>
    </ProtectPage>
  );
}
