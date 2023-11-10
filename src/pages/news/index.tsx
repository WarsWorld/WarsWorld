import { FeaturedNews } from "frontend/components/news/FeaturedNews";
import LinkCard from "frontend/components/layout/LinkCard";
import Head from "next/head";
import { v4 as uuidv4 } from "uuid";
import { ICardInfo } from "frontend/components/layout/LinkCard";
import { trpc } from "frontend/utils/trpc-client";
import { usePlayers } from "frontend/context/players";
import { useState } from "react";
import PageTitle from "frontend/components/layout/PageTitle";

/**
 * previous, the newsCardObjectList data and <LinkCard> component
 * were used to demo / design this page.
 * now i've added rudimentary backend integration that ignores
 * both. i only commented the <LinkCard> stuff out
 * so that the styling can be used again at some point.
 */

const newsCardsObjectList: ICardInfo[] = [
  {
    imgSrc: "/img/layout/newsPage/newsPlaceholder1.png",
    imgAlt: "News placeholderimage 1",
    heading: "Blitz mode is active!",
    text: "Introducing Blitz Mode: faster battles, reduced turn timers. Available now!",
    link: "/",
  },
  {
    imgSrc: "/img/layout/newsPage/newsPlaceholder2.png",
    imgAlt: "News placeholderimage 2",
    heading: "Clans are out!",
    text: "Join forces with friends in the new alliance system. Coordinate attacks, conquer together!",
    link: "/",
  },
  {
    imgSrc: "/img/layout/newsPage/newsPlaceholder3.png",
    imgAlt: "News placeholderimage 3",
    heading: "Commander Challenge",
    text: "Test your skills in solo missions. Conquer challenges and earn exclusive rewards. Are you up for the challenge?",
    link: "/",
  },
  {
    imgSrc: "/img/layout/newsPage/newsPlaceholder4.png",
    imgAlt: "News placeholderimage 4",
    heading: "Tournament Series",
    text: " Battle the best in intense multiplayer matches. Compete for the championship and incredible prizes. Register soon!",
    link: "/",
  },
  {
    imgSrc: "/img/layout/newsPage/newsPlaceholder1.png",
    imgAlt: "News placeholderimage 1",
    heading: "Blitz mode is active!",
    text: "Introducing Blitz Mode: faster battles, reduced turn timers. Available now!",
    link: "/",
  },
  {
    imgSrc: "/img/layout/newsPage/newsPlaceholder2.png",
    imgAlt: "News placeholderimage 2",
    heading: "Clans are out!",
    text: "Join forces with friends in the new alliance system. Coordinate attacks, conquer together!",
    link: "/",
  },
  {
    imgSrc: "/img/layout/newsPage/newsPlaceholder3.png",
    imgAlt: "News placeholderimage 3",
    heading: "Commander Challenge",
    text: "Test your skills in solo missions. Conquer challenges and earn exclusive rewards. Are you up for the challenge?",
    link: "/",
  },
  {
    imgSrc: "/img/layout/newsPage/newsPlaceholder4.png",
    imgAlt: "News placeholderimage 4",
    heading: "Tournament Series",
    text: " Battle the best in intense multiplayer matches. Compete for the championship and incredible prizes. Register soon!",
    link: "/",
  },
];

export default function NewsPage() {
  const allPostsQuery = trpc.post.all.useQuery();

  const [newPostText, setNewPostText] = useState(
    "imagine i typed something here"
  );

  const addPostMutation = trpc.post.add.useMutation({
    onSuccess() {
      // setNewPostText("");
      allPostsQuery.refetch();
    },
  });

  const deletePostMutation = trpc.post.delete.useMutation({
    onSuccess() {
      allPostsQuery.refetch();
    },
  });

  const { currentPlayer } = usePlayers();

  const handleClick = () => {
    if (currentPlayer === undefined) {
      return;
    }

    addPostMutation.mutate({
      playerId: currentPlayer.id,
      text: newPostText,
      title: "sample text",
    });
  };

  return (
    <>
      <Head>
        <title>News | Wars World</title>
      </Head>

      <div className="@w-full @mt-8">
        <PageTitle>News</PageTitle>
      </div>
      <div className="@flex @flex-col @p-5 @gap-10 @w-full @justify-center @items-center">
        <FeaturedNews />
        <button onClick={handleClick}>Create New Post</button>
        <div className="@flex @flex-wrap @gap-8 @justify-center @items-center @max-w-[90vw] @mb-5">
          {allPostsQuery.data?.map((post) => (
            <div key={post.id}>
              {post.authorId === currentPlayer?.id && (
                <button
                  onClick={() => {
                    deletePostMutation.mutate({
                      playerId: currentPlayer.id,
                      postToDeleteId: post.id,
                    });
                  }}
                >
                  x
                </button>
              )}
              <h3>{post.title}</h3>
              <h6>by {post.author.name}</h6>
              <p>{post.text.slice(0, 60)} (...)</p>
            </div>
          ))}

          {/* {newsCardsObjectList.map((item) => {
            return <LinkCard key={uuidv4()} cardInfo={item} />;
          })} */}
        </div>
      </div>
    </>
  );
}
