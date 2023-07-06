import Head from "next/head";
import ThreeLinesText from "frontend/components/layout/ThreeLinesText";
import LeaderboardTable from "../frontend/components/leaderboards/LeaderboradTable";
import { SelectOption } from "frontend/components/layout/Select";
import { useState } from "react";
import BestPlayersSection from "frontend/components/leaderboards/BestPlayersSection";
import { PlayerLeaderboard } from "frontend/components/leaderboards/LeaderboardData";
import LeaderboardFilters from "frontend/components/leaderboards/LeaderboardFilters";

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
    <div className="@flex @flex-col @w-full @items-center @justify-center">
      <Head>
        <title>Leaderboards | Wars World</title>
      </Head>

      <ThreeLinesText
        subtitle="Where the best meet"
        title="Leaderboards"
        text=""
      />

      <div className="@mb-4">
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
  );
}
