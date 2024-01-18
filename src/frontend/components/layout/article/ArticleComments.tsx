import type { inferRouterOutputs } from "@trpc/server";
import { usePlayers } from "frontend/context/players";
import { trpc } from "frontend/utils/trpc-client";
import { useParams } from "next/navigation";
import type { TextareaHTMLAttributes, FormEvent } from "react";
import type { articleRouter } from "server/routers/article";

type ArticleCommentsWithPlayer = NonNullable<
  inferRouterOutputs<typeof articleRouter>["getMarkdownById"]
>["Comments"];

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

export default function ArticleContent({ comments }: Props) {
  const { slug: params } = useParams<{ slug: string[] }>();
  const articleId = params[0];
  const mtx = trpc.article.addComment.useMutation();
  const trpcUtils = trpc.useUtils();
  const { currentPlayer } = usePlayers();

  const handleSubmitComment = async (event: FormEvent) => {
    event.preventDefault();
    const target = event.target as typeof event.target & {
      body: TextareaHTMLAttributes<HTMLTextAreaElement>;
    };

    const body = target.body.value;

    await mtx
      .mutateAsync({
        articleId: Number(articleId),
        body: String(body),
        playerId: currentPlayer!.id,
      })
      .then(async () => {
        await trpcUtils.article.invalidate();
      })
      .catch(() => {});
  };

  return (
    <section className="@w-full @py-8 @px-4 smallscreen:@pl-16 @relative @leading-10">
      <h2 className="@font-bold">Comments</h2>

      <form onSubmit={handleSubmitComment} method="post">
        <textarea name="body" placeholder={"foo"}></textarea>
        <button type="submit">Sub</button>
      </form>

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
