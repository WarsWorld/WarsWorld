import PageTitle from "frontend/components/layout/PageTitle";
import type { SelectOption } from "frontend/components/layout/Select";
import BestPlayersSection from "frontend/components/leaderboards/BestPlayersSection";
import type { PlayerLeaderboard } from "frontend/components/leaderboards/LeaderboardData";
import LeaderboardFilters from "frontend/components/leaderboards/LeaderboardFilters";
import LeaderboardTable from "frontend/components/leaderboards/LeaderboradTable";
import Head from "next/head";
import { useState } from "react";

export default function IndexPage() {
  const [bestPlayers, setBestPlayers] = useState([] as PlayerLeaderboard[]);
  const [gamemode, setGamemode] = useState<SelectOption | undefined>({
    label: "All",
    value: 0,
  });
  const [timeMode, setTimeMode] = useState<SelectOption | undefined>({
    label: "All",
    value: 0,
  });

  return (
    <>
      <Head>
        <title>Leaderboards | Wars World</title>
      </Head>

      <div className="@flex @flex-col @justify-center @items-center @align-middle">
        <div className="@w-full @my-8">
          <PageTitle svgPathD="M280-880h400v314q0 23-10 41t-28 29l-142 84 28 92h152l-124 88 48 152-124-94-124 94 48-152-124-88h152l28-92-142-84q-18-11-28-29t-10-41v-314Zm80 80v234l80 48v-282h-80Zm240 0h-80v282l80-48v-234ZM480-647Zm-40-12Zm80 0Z">
            Leaderboard
          </PageTitle>
        </div>

        <div className="@my-4">
          <BestPlayersSection bestPlayers={bestPlayers} />
        </div>

        <div className="@flex @flex-col @max-w-full @px-4">
          <LeaderboardFilters
            gamemode={gamemode}
            setGamemode={setGamemode}
            timeMode={timeMode}
            setTimeMode={setTimeMode}
          />
          <LeaderboardTable
            setBestPlayers={setBestPlayers}
            gamemode={gamemode}
            timeMode={timeMode}
          />
        </div>
      </div>
    </>
  );
}
