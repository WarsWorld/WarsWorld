import Head from "next/head";
import MatchSection from "frontend/components/match/MatchSection";

export default function SampleMatches() {
  return (
    <>
      <Head>
        <title>Game Lobby | Wars World</title>
      </Head>
      <div className="@flex @justify-center @w-full">
        <div className="@h-full @w-full @p-5 @grid @gap-10 @text-center allGames"></div>
        <div className="@flex @flex-wrap @justify-around">
          {
            <MatchSection
              title={"Matches"}
              description={"Your ongoing matches"}
            />
          }
        </div>
      </div>
    </>
  );
}
