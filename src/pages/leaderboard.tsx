import Head from "next/head";
import ThreeLinesText from "frontend/components/layout/ThreeLinesText";
import LeaderboardTable from "../frontend/components/leaderboards/LeaderboradTable";
import Filter from "frontend/components/leaderboards/Filter";
/* 
  TODO
  - Pagination
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
        <div className="@flex @flex-row @space-x-8 @mb-16">
          <div className="@w-64">
            <Filter label="Gamemode" />
          </div>
          <div className="@w-64">
            <Filter label="Time mode" />
          </div>
          <div className="@w-64">
            <Filter label="Date" />
          </div>
        </div>
        <LeaderboardTable />
      </div>
    </div>
  );
}
