import Select, { SelectOption } from "frontend/components/layout/Select";
import { PlayerMMR } from "pages/players/[playerName]";
import { useState } from "react";
import { SmallMatchCard } from "../SmallMatchCard";

const gamemodes: SelectOption[] = [
  { label: "Standard Live", value: 0 },
  { label: "Standard", value: 1 },
  { label: "Fog of War", value: 2 },
  { label: "Fog of War Live", value: 3 },
  { label: "High Funds", value: 4 },
  { label: "High Funds Live", value: 5 },
];

type Props = {
  playerMMRArray: PlayerMMR[] | undefined;
};

export function PlayerSelectLeagueSection({ playerMMRArray }: Props) {
  const [gamemode, setGamemode] = useState<SelectOption | undefined>({
    label: "Standard Live",
    value: 0,
  });

  const currentLeague = playerMMRArray?.find((league) => league.leagueType === gamemode?.label);

  return (
    <section className="@pb-8 @py-8 laptop:@py-0 laptop:@pb-4 @px-4 smallscreen:@px-6 laptop:@px-8 @h-full @w-full @bg-black/60 @my-4 @space-y-4">
      <div className="@grid smallscreen:@grid-cols-4">
        <Select
          className="smallscreen:@col-span-2 laptop:@col-span-1 @self-center @h-10 monitor:@h-12 @order-2 smallscreen:@order-1"
          options={gamemodes}
          onChange={(o) => setGamemode(o)}
          value={gamemode}
        />
        <h1 className="smallscreen:@col-span-2 laptop:@col-span-3 @font-russoOne smallscreen:@px-16 @uppercase @order-1 smallscreen:@order-2">
          {currentLeague?.leagueType}
        </h1>
      </div>
      <div className="@grid smallscreen:@grid-cols-8 laptop:@grid-cols-12 @gap-8">
        <div className="@flex @flex-col @col-span-3">
          <h2 className="@font-russoOne @text-2xl monitor:@text-4xl @my-2">
            Rank: #{currentLeague?.rank}
          </h2>
          <p className="@font-russoOne @text-xl monitor:@text-2xl">MMR: {currentLeague?.mmr}</p>
          <p className="@font-russoOne @text-xl monitor:@text-2xl">
            Max MMR: {currentLeague?.topMmr}
          </p>
          <p className="@text-sm monitor:@text-lg">Last game: 06/29/2023</p>
          <div className="@mt-4">
            <p className="@font-russoOne @text-xl @text-green-earth monitor:@text-2xl">
              WINS: <span className="@text-white">{currentLeague?.wins}</span>
            </p>
            <p className="@font-russoOne @text-xl @text-orange-star monitor:@text-2xl">
              LOSES: <span className="@text-white">{currentLeague?.losses}</span>
            </p>
            <p className="@font-russoOne @text-xl @text-bg-tertiary monitor:@text-2xl">
              DRAWS: <span className="@text-white">{currentLeague?.draws}</span>
            </p>
          </div>
        </div>
        <div className="@flex @flex-col @h-full @p-2 @col-span-5">
          <div className="@w-full @h-56 smallscreen:@h-full @border-primary @border-4 @bg-bg-secondary @text-center">
            GRAPH
          </div>
        </div>
        <div className="@grid @grid-rows-5 @gap-4 monitor:@gap-6 @h-full @col-span-5 smallscreen:@col-span-8 laptop:@col-span-4">
          <SmallMatchCard
            matchResult="W"
            player1={{ co: "grimm", name: "Grimm Guy" }}
            player2={{ co: "eagle", name: "Itou Kaiji" }}
            matchLink="/"
          />
          <SmallMatchCard
            matchResult="L"
            player1={{ co: "koal", name: "Itou Kaiji" }}
            player2={{ co: "grimm", name: "Grimm Guy" }}
            matchLink="/"
          />
          <SmallMatchCard
            matchResult="D"
            player1={{ co: "sasha", name: "CliveGlitch" }}
            player2={{ co: "javier", name: "Itou Kaiji" }}
            matchLink="/"
          />
          <SmallMatchCard
            matchResult="W"
            player1={{ co: "sonja", name: "Itou Kaiji" }}
            player2={{ co: "grimm", name: "Grimm Guy" }}
            matchLink="/"
          />
          <SmallMatchCard
            matchResult="W"
            player1={{ co: "grimm", name: "Grimm Guy" }}
            player2={{ co: "olaf", name: "Itou Kaiji" }}
            matchLink="/"
          />
        </div>
      </div>
    </section>
  );
}
