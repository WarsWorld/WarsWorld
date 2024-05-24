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
          <PageTitle svgPathD="M440-240h80v-120h120v-80H520v-120h-80v120H320v80h120v120ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z">
            Create Article
          </PageTitle>
        </div>

        <div className="@w-full">
          <CreateArticleForm articleData={articleData} setArticleData={setArticleData} />
          <div className="@mt-8 @w-full">
            <PageTitle svgPathD="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z">
              Preview
            </PageTitle>
          </div>

          <ArticleContent contentHTML={markdownToHTML(articleData.body)} />
        </div>
      </div>
    </ProtectPage>
  );
}
