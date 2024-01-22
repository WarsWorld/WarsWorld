import { type FormEvent, useState, type Dispatch, type SetStateAction } from "react";
import Select, { type SelectOption } from "../Select";
import SquareButton from "../SquareButton";
import OrangeGradientLine from "../decorations/OrangeGradientLine";
import ErrorSuccessBlock from "../forms/ErrorSuccessBlock";
import FormInput from "../forms/FormInput";
import type{ ArticleCategory } from "@prisma/client";
import { usePlayers } from "frontend/context/players";
import { trpc } from "frontend/utils/trpc-client";
import { articleSchema, type ArticleCategories } from "shared/schemas/article";
import { stringToSlug } from "pages/articles/[...slug]";
import Link from "next/link";
import TextAreaInput from "../forms/TextAreaInput";
import { ZodError } from "zod";
import { TRPCClientError } from "@trpc/client";


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
  const [formErrors, setFormErrors] = useState<ZodError>();
  const [error, setError] = useState("");
  const [newstCreatedArticleLink, setNewestCreatedArticleLink] = useState("");

  const { mutateAsync: createArticle, isSuccess } = trpc.article.create.useMutation();

  const clearForm = () => {
    setArticleData({
      title: "",
      description: "",
      category: "patch",
      body: "",
      thumbnail: "",
    });
    setCategoryOption({ label: "Patch", value: "patch" });
    setError("");
  }

  const onSubmitArticleForm = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const parsedArticle = articleSchema.parse({
        title: articleData.title.trim(),
        description: articleData.description.trim(),
        body: articleData.body.trim(),
        thumbnail: articleData.thumbnail.trim(),
        category: articleData.category as ArticleCategory,
      });

      const newArticle = await createArticle({
        ...parsedArticle,
        playerId: currentPlayer?.id ?? "",
      });

      setNewestCreatedArticleLink(`${newArticle.id}/${stringToSlug(newArticle.title)}`);
      setFormErrors(undefined);
      clearForm();

    } catch (err) {
      if(err instanceof ZodError) {
        setFormErrors(err);
      } else if(err instanceof TRPCClientError) {
        setError(err.message);
      } else {
        setError("There was an error while trying to post the article. Please try again.");
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onChangeGenericHandler = (identifier: string, value: string) => {
    setArticleData((prevData) => ({
      ...prevData,
      [identifier]: value,
    }));
  };

  const titleError = formErrors?.issues?.find(error => error.path[0] == "title");
  const descriptionError = formErrors?.issues?.find(error => error.path[0] == "description");
  const thumbnailError = formErrors?.issues?.find(error => error.path[0] == "thumbnail");
  const bodyError = formErrors?.issues?.find(error => error.path[0] == "body") ;

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
        {error && <ErrorSuccessBlock className="@h-20 @mb-8" title={error} isError />}
        <div className="@grid @grid-flow-row @grid-cols-4">
          <FormInput 
            value={articleData.title}
            onChange={(event) => 
                        onChangeGenericHandler("title", event.target.value)
                      }
            className="@my-4 @w-full @mb-8 @col-span-4 smallscreen:@col-span-3" 
            text="Title"
            type="text"
            isError={titleError != undefined} 
            errorMessage={titleError?.message}
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
            isError={descriptionError != undefined} 
            errorMessage={descriptionError?.message}
          />
          <FormInput 
            value={articleData.thumbnail}
            onChange={(event) => 
              onChangeGenericHandler("thumbnail", event.target.value)
            }
            className="@mt-8 @col-span-4" 
            type="text"
            text="Thumbnail" 
            isError={thumbnailError != undefined} 
            errorMessage={thumbnailError?.message}
          />

          <TextAreaInput 
            value={articleData.body}
            onChange={(event) => 
              onChangeGenericHandler("body", event.target.value)
            }
            className="@col-span-4 @mt-12"
            text="Content" 
            height="50rem"
            isError={bodyError != undefined} 
            errorMessage={bodyError?.message}
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