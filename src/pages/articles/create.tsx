import Select from "frontend/components/layout/Select";
import FormInput from "frontend/components/layout/forms/FormInput";
import Head from "next/head";
import type { SelectOption } from "frontend/components/layout/Select";
import { type FormEvent, useState, useEffect } from "react";
import { remark } from "remark";
import html from "remark-html";
import ArticleContent from "frontend/components/layout/article/ArticleContent";
import type { ArticleCategories } from "shared/schemas/article";
import { trpc } from "frontend/utils/trpc-client";
import SquareButton from "frontend/components/layout/SquareButton";
import type { ArticleCategory } from "@prisma/client";
import { usePlayers } from "frontend/context/players";
import ErrorSuccessBlock from "frontend/components/layout/forms/ErrorSuccessBlock";
import { ZodError } from "zod";
import OrangeGradientLine from "frontend/components/layout/decorations/OrangeGradientLine";
import PageTitle from "frontend/components/layout/PageTitle";

const CATEGORIES = [
  { label: "News", value: "news" },
  { label: "Patch", value: "patch" },
  { label: "Events", value: "events" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Site", value: "site" },
  { label: "Basics", value: "basics" },
  { label: "Advance", value: "advance" },
] satisfies { label: string, value: ArticleCategories }[];

export default function Create() {
  const { currentPlayer } = usePlayers();

  const [categoryOption, setCategoryOption] = useState<SelectOption | undefined>({ label: "Patch", value: "patch" });
  const [shownError, setShownError] = useState("");
  const [articleData, setArticleData] = useState({
    title: "",
    description: "",
    thumbnail: "",
    body: "",
    category: "patch",
  });

  const onChangeGenericHandler = (identifier: string, value: string) => {
    setArticleData((prevData) => ({
      ...prevData,
      [identifier]: value,
    }));
  };

  const { mutateAsync: createArticle, error, isError } = trpc.article.create.useMutation();

  const htmlMarkDown = remark().use(html).processSync(articleData.body);

  const onSubmitArticleForm = async (event: FormEvent) => {
    event.preventDefault();

    try {
      await createArticle({
        title: articleData.title,
        description: articleData.description,
        body: articleData.body,
        thumbnail: articleData.thumbnail,
        category: articleData.category as ArticleCategory,
        playerId: currentPlayer?.id ?? "",
      });
    } catch (e) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
  };

  useEffect(() => {
    if(error?.data?.zodError) {
      const parsedErrors = JSON.parse(error?.message) as ZodError[];
      setShownError(parsedErrors[0].message);
    }
  }, [error])

  return (
    <>
      <Head>
        <title>Create Artcile | Wars World</title>
      </Head>

      <div className="@my-8 @w-full" >
        <PageTitle svgPathD="M440-240h80v-120h120v-80H520v-120h-80v120H320v80h120v120ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z">Create Article</PageTitle>
      </div>

      <div className="@w-full">
        <OrangeGradientLine />
        <form 
          className="@px-32 @py-10 @bg-black/70"
          onSubmit={(event: FormEvent) => {
            void onSubmitArticleForm(event);
          }}
        >
          {isError && <ErrorSuccessBlock className="@h-20 @mb-8" title={shownError} isError />}
          <div className="@grid @grid-flow-row @grid-cols-4">
            <FormInput 
              onChange={(event) => 
                          onChangeGenericHandler(
                            "title", 
                            (event.target as HTMLInputElement).value
                          )
                        }
              className="@my-4 @w-full @col-span-3" 
              text="Title" 
            />
            <div className="@ml-12">
              <label
                htmlFor=""
                className={`@text-xl smallscreen:@text-2xl @text-white`}
              >
                Category
              </label>
              <Select 
                className="@my-5 @w-full @h-16 @text-2xl" 
                options={CATEGORIES} 
                value={categoryOption} 
                onChange={(o) => {
                  setCategoryOption(o);
                  onChangeGenericHandler("category", o?.value.toString() ?? "");
                }}/>
            </div>
            <FormInput 
              onChange={(event) => 
                onChangeGenericHandler(
                  "description", 
                  (event.target as HTMLInputElement).value
                )
              }
              className="@my-4 @col-span-4" 
              text="Description" 
            />
            <FormInput 
              onChange={(event) => 
                onChangeGenericHandler(
                  "thumbnail", 
                  (event.target as HTMLInputElement).value
                )
              }
              className="@my-4 @col-span-4" 
              text="Thumbnail" 
            />

            <div className="@col-span-4" >
              <label
                htmlFor=""
                className={`@text-xl smallscreen:@text-2xl @text-white`}
              >
                Content
              </label>
              <textarea 
                className="@my-4 @w-full @min-h-96 @text-black @p-4 @text-xl @border-4 @border-primary @rounded-2xl" 
                placeholder="Write here... "
                value={articleData.body}
                onChange={(event) => onChangeGenericHandler("body", event.target.value)}
              />
            </div>
          </div>

          <div className="@flex @flex-col @items-center @justify-center @pt-4 @px-10">
            <div className="@w-[80vw] smallscreen:@w-96 @h-20 @text-5xl @my-2">
              <SquareButton>Submit</SquareButton>
            </div>
          </div>
        </form>
        <OrangeGradientLine />
        
        <div className="@mt-8 @w-full" >
          <PageTitle svgPathD="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z">Preview</PageTitle>
        </div>

        <ArticleContent contentHTML={htmlMarkDown.toString()}/>
      </div>
    </>
  )
}