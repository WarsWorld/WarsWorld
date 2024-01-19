import { type FormEvent, useState, useEffect, type Dispatch, type SetStateAction } from "react";
import Select, { type SelectOption } from "../Select";
import SquareButton from "../SquareButton";
import OrangeGradientLine from "../decorations/OrangeGradientLine";
import ErrorSuccessBlock from "../forms/ErrorSuccessBlock";
import FormInput from "../forms/FormInput";
import type{ ArticleCategory } from "@prisma/client";
import { usePlayers } from "frontend/context/players";
import { trpc } from "frontend/utils/trpc-client";
import type { ArticleCategories } from "shared/schemas/article";
import { stringToSlug } from "pages/articles/[...slug]";
import Link from "next/link";
import TextAreaInput from "../forms/TextAreaInput";
import type { ZodIssue } from "zod";


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
  const [shownErrors, setShownErrors] = useState<ZodIssue[]>();
  const [newstCreatedArticleLink, setNewestCreatedArticleLink] = useState("");

  const { mutateAsync: createArticle, error, isError, isSuccess } = trpc.article.create.useMutation();

  const clearForm = () => {
    setArticleData({
      title: "",
      description: "",
      category: "patch",
      body: "",
      thumbnail: "",
    });
    setCategoryOption({ label: "Patch", value: "patch" })
  }

  const onSubmitArticleForm = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const newArticle = await createArticle({
        title: articleData.title,
        description: articleData.description,
        body: articleData.body,
        thumbnail: articleData.thumbnail,
        category: articleData.category as ArticleCategory,
        playerId: currentPlayer?.id ?? "",
      });

      setNewestCreatedArticleLink(`${newArticle.id}/${stringToSlug(newArticle.title)}`);
      clearForm();

    } catch (e) {}

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if(error?.data?.zodError) {
      const parsedErrors = JSON.parse(error?.message) as ZodIssue[];
      setShownErrors(parsedErrors);
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
        {isSuccess && (
          <Link className="@text-white hover:@text-white" href={newstCreatedArticleLink}>
            <ErrorSuccessBlock 
              className="@h-28 @mb-8 hover:@translate-y-1 @duration-300" 
              title="Article successfully created" 
              message="Click this box to see the newest article." 
            />
          </Link>
        )}
        {isError && <ErrorSuccessBlock className="@h-20 @mb-8" title="There are validation errors." isError />}
        <div className="@grid @grid-flow-row @grid-cols-4">
          <FormInput 
            value={articleData.title}
            onChange={(event) => 
                        onChangeGenericHandler("title", event.target.value)
                      }
            className="@my-4 @w-full @mb-8 @col-span-4 smallscreen:@col-span-3" 
            text="Title"
            type="text"
            isError={shownErrors?.find(error => error.path[0] == "title") != undefined} 
            errorMessage={shownErrors?.find(error => error.path[0] == "title")?.message}
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
          <TextAreaInput 
            value={articleData.description}
            onChange={(event) => 
              onChangeGenericHandler("description", event.target.value)
            }
            className="@col-span-4"
            text="Description" 
            height="20rem"
            isError={shownErrors?.find(error => error.path[0] == "description") != undefined} 
            errorMessage={shownErrors?.find(error => error.path[0] == "description")?.message}
          />
          <FormInput 
            value={articleData.thumbnail}
            onChange={(event) => 
              onChangeGenericHandler("thumbnail", event.target.value)
            }
            className="@mt-8 @col-span-4" 
            type="text"
            text="Thumbnail" 
            isError={shownErrors?.find(error => error.path[0] == "thumbnail") != undefined} 
            errorMessage={shownErrors?.find(error => error.path[0] == "thumbnail")?.message}
          />

          <TextAreaInput 
            value={articleData.body}
            onChange={(event) => 
              onChangeGenericHandler("body", event.target.value)
            }
            className="@col-span-4 @mt-12"
            text="Content" 
            height="50rem"
            isError={shownErrors?.find(error => error.path[0] == "body") != undefined} 
            errorMessage={shownErrors?.find(error => error.path[0] == "body")?.message}
          />
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