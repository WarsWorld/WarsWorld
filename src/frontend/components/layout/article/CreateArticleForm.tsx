import { type FormEvent, useState, useEffect, type Dispatch, type SetStateAction } from "react";
import Select, { type SelectOption } from "../Select";
import SquareButton from "../SquareButton";
import OrangeGradientLine from "../decorations/OrangeGradientLine";
import ErrorSuccessBlock from "../forms/ErrorSuccessBlock";
import FormInput from "../forms/FormInput";
import type{ ArticleCategory } from "@prisma/client";
import { usePlayers } from "frontend/context/players";
import { trpc } from "frontend/utils/trpc-client";
import type { ZodError } from "zod";
import type { ArticleCategories } from "shared/schemas/article";

const CATEGORIES = [
  { label: "News", value: "news" },
  { label: "Patch", value: "patch" },
  { label: "Events", value: "events" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Site", value: "site" },
  { label: "Basics", value: "basics" },
  { label: "Advance", value: "advance" },
] satisfies { label: string, value: ArticleCategories }[];

type ArticleData = {
  title: string,
  description: string,
  thumbnail: string,
  body: string,
  category: string,
};

type Props = {
  articleData: ArticleData,
  setArticleData: Dispatch<SetStateAction<ArticleData>>,
}

export default function CreateArticleForm({ articleData, setArticleData } : Props) {
  const { currentPlayer } = usePlayers();

  const [categoryOption, setCategoryOption] = useState<SelectOption | undefined>({ label: "Patch", value: "patch" });
  const [shownError, setShownError] = useState("");

  const { mutateAsync: createArticle, error, isError } = trpc.article.create.useMutation();

  const onSubmitArticleForm = async (event: FormEvent) => {
    event.preventDefault();

    try {

      // TODO: Success Screen
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

  const onChangeGenericHandler = (identifier: string, value: string) => {
    setArticleData((prevData) => ({
      ...prevData,
      [identifier]: value,
    }));
  };

  return(
    <>
      <OrangeGradientLine />
      <form 
        className="@px-4 smallscreen:@px-32 @py-10 @bg-black/70"
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
            className="@my-4 @w-full @h-20 @mb-8 @col-span-4 smallscreen:@col-span-3" 
            text="Title" 
          />
          <div className="@my-4 smallscreen:@my-0 smallscreen:@ml-12 @col-span-4 smallscreen:@col-span-1">
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
          <div className="@col-span-4 @mt-8">
            <label
              htmlFor=""
              className={`@text-xl smallscreen:@text-2xl @text-white`}
            >
              Description
            </label>
            <textarea 
              className="@my-4 @w-full @h-72 @text-black @p-4 @text-xl @border-4 @border-primary @rounded-2xl" 
              placeholder="Write here... "
              value={articleData.description}
              onChange={(event) => onChangeGenericHandler("description", event.target.value)}
            />
          </div>
          <FormInput 
            onChange={(event) => 
              onChangeGenericHandler(
                "thumbnail", 
                (event.target as HTMLInputElement).value
              )
            }
            className="@mt-8 @col-span-4 @h-20" 
            text="Thumbnail" 
          />

          <div className="@col-span-4 @mt-20">
            <label
              htmlFor=""
              className={`@text-xl smallscreen:@text-2xl @text-white`}
            >
              Content
            </label>
            <textarea 
              className="@my-4 @w-full @h-[100vh] @text-black @p-4 @text-xl @border-4 @border-primary @rounded-2xl" 
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
    </>
  );
}