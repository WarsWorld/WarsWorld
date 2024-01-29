import { usePlayers } from "frontend/context/players";
import { trpc } from "frontend/utils/trpc-client";
import { useParams } from "next/navigation";
import { type TextareaHTMLAttributes, type FormEvent, useState } from "react";
import TextAreaInput from "../forms/TextAreaInput";
import { articleCommentSchema, type ArticleCommentsWithPlayer } from "shared/schemas/article";
import SquareButton from "../SquareButton";
import { ZodError } from "zod";
import { TRPCClientError } from "@trpc/client";

type Props = {
  comments: ArticleCommentsWithPlayer;
};

const getFormattedTime = (createdAt: Date) => {
  const dateDiff = Date.now() - createdAt.getTime();

  const hoursSinceComment = Math.round(dateDiff / 1000 / 60 / 60);

  if (hoursSinceComment < 1) {
    return "Just now";
  }

  const daysSinceComment = Math.round(hoursSinceComment / 24);
  const isMoreThanADayAgo = hoursSinceComment >= 24;
  const timeSinceComment = isMoreThanADayAgo ? daysSinceComment : hoursSinceComment;

  return new Intl.RelativeTimeFormat("en", {
    localeMatcher: "best fit",
    style: "narrow",
  }).format(-timeSinceComment, isMoreThanADayAgo ? "day" : "hour");
};

export default function ArticleCommentSection({ comments }: Props) {
  const { slug: params } = useParams<{ slug: string[] }>();
  const articleId = params[0];
  const { mutateAsync: createComment } = trpc.article.addComment.useMutation();
  const trpcUtils = trpc.useUtils();
  const { currentPlayer } = usePlayers();
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmitComment = async (event: FormEvent) => {
    event.preventDefault();
    const target = event.target as typeof event.target &
      HTMLFormElement & {
        comment: TextareaHTMLAttributes<HTMLTextAreaElement>;
      };

    const comment = target.comment.value;

    try {
      const parsedComment = articleCommentSchema.parse({
        articleId: Number(articleId),
        comment: String(comment).trim(),
      });

      await createComment({
        ...parsedComment,
        playerId: currentPlayer!.id,
      });

      await trpcUtils.article.invalidate();
      setErrorMessage("");
      target.reset();
    } catch (err) {
      if (err instanceof ZodError) {
        setErrorMessage(err.issues[0].message);
      } else if (err instanceof TRPCClientError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("There was an error posting your comment. Please try again.");
      }
    }
  };

  return (
    <section className="@w-full @p-12 @relative @leading-10">
      <h2 className="@font-bold">Comments</h2>

      {currentPlayer ? (
        <div className="@w-full">
          <form
            onSubmit={(event) => {
              void handleSubmitComment(event);
            }}
            method="post"
            className="@flex @flex-col"
          >
            <TextAreaInput
              name="comment"
              height="16vh"
              text=""
              isError={errorMessage != ""}
              errorMessage={errorMessage}
            />
            <div className="@self-end @my-4">
              <SquareButton type="submit">Add comment</SquareButton>
            </div>
          </form>
        </div>
      ) : (
        <div>Please login to write a comment.</div>
      )}

      <div className="@flex @flex-col @gap-4">
        {comments.map((comment) => {
          const { createdAt, articleId, playerId, player, body } = comment;
          const formattedTime = getFormattedTime(createdAt);

          return (
            <div
              role="comment"
              key={articleId + playerId + createdAt.toJSON()}
              className="@bg-bg-tertiary smallscreen:@p-10 @p-2 @rounded-2xl @shadow-xl @shadow-black"
            >
              <div className="@flex @gap-2">
                <strong>{player.name}</strong>
                <time className="@text-gray-300" dateTime={createdAt.toJSON()}>
                  {formattedTime}
                </time>
              </div>
              <div>{body}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
