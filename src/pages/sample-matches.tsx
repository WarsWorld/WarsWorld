import Head from "next/head";
import MatchSection from "frontend/components/match/MatchSection";

export default function SampleMatches() {
  return (
    <>
      <Head>
        <title>Game Lobby | Wars World</title>
      </Head>

      <div className="@flex @w-full">
        <MatchSection title={"Matches"} description={"Your ongoing matches"} />
      </div>
    </>
  );
}
