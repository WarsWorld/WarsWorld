import Head from "next/head";
import ThreeLinesText from "frontend/components/layout/ThreeLinesText";
import LeaderboardTable from "../frontend/components/leaderboards/LeaderboradTable";
import Select, { SelectOption } from "frontend/components/layout/Select";
import { useState } from "react";
import PlayerCard from "../frontend/components/leaderboards/PlayerCard";
/* 
  TODO
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
    <div className="@flex @flex-col @w-[100vw] @items-center @justify-center">
      <Head>
        <title>Leaderboards</title>
      </Head>

      <ThreeLinesText
        subtitle="Where the best meet"
        title="Leaderboards"
        text=""
      />
      <div className="@flex @flex-row @flex-wrap @mb-8 @justify-center @items-center">
        <div className="@w-32 smallscreen:@w-56 @h-[50vh] @mb-8 @mx-4">
          <PlayerCard
            name="StarFlash"
            rank={1}
            mmr={1643}
            country="orangeStar"
            co="kindle"
            profileLink="/"
          />
        </div>
        <div className="@w-32 smallscreen:@w-56 @h-[50vh] @mb-8 @mx-4">
          <PlayerCard
            name="Po1and"
            rank={2}
            mmr={1612}
            country="greenEarth"
            co="sami"
            profileLink="/"
          />
        </div>
        <div className="@w-32 smallscreen:@w-56 @h-[50vh] @mb-8 @mx-4">
          <PlayerCard
            name="Tordread"
            rank={3}
            mmr={1599}
            country="yellowComet"
            co="lash"
            profileLink="/"
          />
        </div>
        <div className="@w-32 smallscreen:@w-56 @h-[50vh] @mb-8 @mx-4">
          <PlayerCard
            name="Spoot"
            rank={4}
            mmr={1587}
            country="blueMoon"
            co="grit"
            profileLink="/"
          />
        </div>
        <div className="@w-32 smallscreen:@w-56 @h-[50vh] @mb-8 @mx-4">
          <PlayerCard
            name="sothe-"
            rank={5}
            mmr={1576}
            country="greenEarth"
            co="jess"
            profileLink="/"
          />
        </div>
        <div className="@w-32 smallscreen:@w-56 @h-[50vh] @mb-8 @mx-4">
          <PlayerCard
            name="Go7"
            rank={6}
            mmr={1554}
            country="blueMoon"
            co="olaf"
            profileLink="/"
          />
        </div>
        <div className="@w-32 smallscreen:@w-56 @h-[50vh] @mb-8 @mx-4">
          <PlayerCard
            name="斯大林"
            rank={7}
            mmr={1524}
            country="orangeStar"
            co="andy"
            profileLink="/"
          />
        </div>
      </div>
      <div className="@flex @flex-col @max-w-full @px-4">
        <div className="@grid @grid-cols-1 @gap-6 tablet:@grid-cols-2 smallscreen:@grid-cols-3 laptop:@gap-4 laptop:@grid-cols-4 monitor:@grid-cols-6 @mb-12">
          <div className="@w-56 @space-y-2">
            <label>Gamemode</label>
            <Select
              options={gamemodes}
              value={gamemode}
              onChange={(o) => setGamemode(o)}
            />
          </div>
          <div className="@w-56 @space-y-2">
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
