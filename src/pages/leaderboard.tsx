import Head from "next/head";
import ThreeLinesText from "frontend/components/layout/ThreeLinesText";
import LeaderboardTable from "../frontend/components/leaderboards/LeaderboradTable";
import Select, { SelectOption } from "frontend/components/layout/Select";
import { useState } from "react";
/* 
  TODO
  - Pagination
  - Filters
  - Best Players Banner
*/

const gamemodes = [
  { label: "All", value: 0 },
  { label: "Standard", value: 1 },
  { label: "Fog of War", value: 2 },
  { label: "High Funds", value: 3 },
];
const timeModes = [
  { label: "All", value: 0 },
  { label: "Async", value: 1 },
  { label: "Live", value: 2 },
];

export default function IndexPage() {
  const [gamemode, setGamemode] = useState<SelectOption | undefined>(
    gamemodes[0]
  );
  const [timeMode, setTimeMode] = useState<SelectOption | undefined>(
    timeModes[0]
  );

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
        <div className="@grid @grid-cols-1 smallscreen:@grid-cols-2 @gap-6 laptop:@gap-4 laptop:@grid-cols-3 monitor:@grid-cols-4 @mb-12">
          <div className="@w-72 @space-y-2">
            <label>Gamemode</label>
            <Select
              options={gamemodes}
              value={gamemode}
              onChange={(o) => setGamemode(o)}
            />
          </div>
          <div className="@w-72 @space-y-2">
            <label>Time mode</label>
            <Select
              options={timeModes}
              value={timeMode}
              onChange={(o) => setTimeMode(o)}
            />
          </div>
        </div>
        <LeaderboardTable />
      </div>
    </div>
  );
}
