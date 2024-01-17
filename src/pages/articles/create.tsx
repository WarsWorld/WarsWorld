import Select from "frontend/components/layout/Select";
import FormInput from "frontend/components/layout/forms/FormInput";
import Head from "next/head";
import type { SelectOption } from "frontend/components/layout/Select";
import { type FormEvent, useState } from "react";
import { remark } from "remark";
import html from "remark-html";
import ArticleContent from "frontend/components/layout/article/ArticleContent";
import type { ArticleCategories } from "shared/schemas/article";
import { trpc } from "frontend/utils/trpc-client";
import SquareButton from "frontend/components/layout/SquareButton";
import { ArticleCategory } from "@prisma/client";
import { usePlayers } from "frontend/context/players";

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

  const { mutateAsync: createArticle } = trpc.article.create.useMutation();

  const htmlMarkDown = remark().use(html).processSync(articleData.body);

  const onSubmitArticleForm = async (event: FormEvent) => {
    event.preventDefault();

    await createArticle({
      title: articleData.title,
      description: articleData.description,
      body: articleData.body,
      thumbnail: articleData.thumbnail,
      category: articleData.category as ArticleCategory,
      playerId: currentPlayer?.id ?? "",
    });
  };

  return (
    <>
      <Head>
        <title>Create Artcile | Wars World</title>
      </Head>

      <div className="@w-full @my-12">
        <form 
          className="@px-20"
          onSubmit={(event: FormEvent) => {
            void onSubmitArticleForm(event);
          }}
        >
          <FormInput 
            onChange={(event) => 
                        onChangeGenericHandler(
                          "title", 
                          (event.target as HTMLInputElement).value
                        )
                      }
            className="@my-4" 
            text="Title" 
            />
          <FormInput 
            onChange={(event) => 
              onChangeGenericHandler(
                "description", 
                (event.target as HTMLInputElement).value
              )
            }
            className="@my-4" 
            text="Description" 
          />
          <FormInput 
            onChange={(event) => 
              onChangeGenericHandler(
                "thumbnail", 
                (event.target as HTMLInputElement).value
              )
            }
            className="@my-4" 
            text="Thumbnail" 
          />
          <label
            htmlFor=""
            className={`@text-xl smallscreen:@text-2xl @text-white`}
          >
            Category
          </label>
          <Select 
            className="@my-4" 
            options={CATEGORIES} 
            value={categoryOption} 
            onChange={(o) => {
              setCategoryOption(o);
              onChangeGenericHandler("category", o?.value.toString() ?? "");
            }}/>
          
          <textarea 
            className="@my-4 @w-full @h-96 @text-black @p-4 @text-xl @border-4 @border-primary @rounded-2xl" 
            placeholder="Write here... "
            value={articleData.body}
            onChange={(event) => onChangeGenericHandler("body", event.target.value)}
          />

          <div className="@flex @flex-col @items-center @justify-center @pt-4 @px-10">
            <div className="@w-[80vw] smallscreen:@w-96 @h-16 @text-3xl @my-2">
              <SquareButton>Submit</SquareButton>
            </div>
          </div>
        </form>

        <ArticleContent contentHTML={htmlMarkDown.toString()}/>
      </div>
    </>
  )
}