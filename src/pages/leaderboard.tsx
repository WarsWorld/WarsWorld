import Head from "next/head";
import ThreeLinesText from "frontend/components/layout/ThreeLinesText";
import LeaderboardTable from "../frontend/components/leaderboards/LeaderboradTable";

/* 
  TODO
  - Pagination
  - Responsiveness, take out columns games, 
      win rate and streak when the screen is small
  - Filters
  - Best Players Banner
*/

export default function IndexPage() {
  return (
    <div className="@flex @flex-col @w-full @items-center @justify-center">
      <Head>
        <title>Leaderboards</title>
      </Head>

      <div className="@flex @flex-col @max-w-full @px-4">
        <ThreeLinesText
          subtitle="Where the best meet"
          title="Leaderboards"
          text=""
        />
        <LeaderboardTable />
      </div>
    </div>
  );
}
