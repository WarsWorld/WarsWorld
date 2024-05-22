import { getCoreRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table";
import type { SelectOption } from "frontend/components/layout/Select";
import Select from "frontend/components/layout/Select";
import MMRDataTable from "frontend/components/player-profile/MMRDataTable";
import { columns } from "frontend/components/player-profile/MMRTableColumns";
import PlayerMMRCard from "frontend/components/player-profile/PlayerMMRCard";
import SmallMatchCard from "frontend/components/player-profile/SmallMatchCard";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export type PlayerMMR = {
  rank: number;
  leagueType: string;
  topMmr: number;
  mmr: number;
  wins: number;
  losses: number;
  draws: number;
};

const gamemodes = [
  { label: "Standard Live", value: 0 },
  { label: "Standard", value: 1 },
  { label: "Fog of War", value: 2 },
  { label: "Fog of War Live", value: 3 },
  { label: "High Funds", value: 4 },
  { label: "High Funds Live", value: 5 },
];

const playerMMRArray: PlayerMMR[] = [
  {
    rank: 1,
    leagueType: "STD",
    topMmr: 3000,
    mmr: 2800,
    wins: 50,
    losses: 30,
    draws: 5,
  },
  {
    rank: 32,
    leagueType: "FOG",
    topMmr: 3200,
    mmr: 3100,
    wins: 60,
    losses: 20,
    draws: 10,
  },
  {
    rank: 21,
    leagueType: "HF",
    topMmr: 3400,
    mmr: 3300,
    wins: 70,
    losses: 10,
    draws: 15,
  },
];

export default function UserProfile() {
  const { query } = useRouter();
  const [mmr_std_data, setSTDData] = useState([] as PlayerMMR[]);
  const [mmr_fog_data, setFOGData] = useState([] as PlayerMMR[]);
  const [mmr_hf_data, setHFData] = useState([] as PlayerMMR[]);

  const [gamemode, setGamemode] = useState<SelectOption | undefined>({
    label: "Standard Live",
    value: 0,
  });

  useEffect(() => {
    setSTDData(playerMMRArray.filter((item) => item.leagueType === "STD"));
    setFOGData(playerMMRArray.filter((item) => item.leagueType === "FOG"));
    setHFData(playerMMRArray.filter((item) => item.leagueType === "HF"));
  }, []);

  const table = useReactTable({
    data: mmr_std_data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const playerName = query?.playerName;

  return (
    <div className="@w-[90vw] @my-4">
      <section className="@h-full @bg-black/60 @my-4 @rounded-t-xl @overflow-hidden">
        <div className="@h-4 @w-full @bg-blue-moon" />
        <div className="@flex @space-x-12 @px-12 @py-10">
          <div className="@min-w-48 @h-48 @border-blue-moon @bg-black/50 @border-4 @text-center @overflow-hidden">
            <img src="\img\CO\smoothFull\Awds-grit.webp" alt="grit" />
          </div>
          <div className="@min-h-48 @flex @flex-col">
            <div>
              <div className="@flex @justify-between">
                <div>
                  <div className="@flex @space-x-2">
                    <img
                      className="[image-rendering:pixelated] @self-center @w-8 @h-8"
                      src="\img\nations\blue-moon.gif"
                      alt="blue-moon"
                    />
                    <div className="@text-4xl @font-semibold">{playerName}</div>
                  </div>
                  <div className="@text-gray-500">Real Name</div>
                </div>
                <div className="@space-y-2">
                  <div className="@flex @h-6 @space-x-2 @items-center">
                    <div className="@bg-green-earth @h-6 @w-6 @rounded-full"></div>
                    <div className="@text-xl">Online</div>
                  </div>
                  <div className="@text-base @text-gray-500">Last Activity: 05/21/2024 05:04pm</div>
                </div>
              </div>
              <div className="@pt-6 @text-base">
                Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quaerat, sed recusandae,
                perspiciatis libero minima porro ut quisquam alias vero ratione reiciendis optio
                voluptates totam dolor soluta enim repellendus asperiores voluptatum. Lorem ipsum
                dolor sit amet, consectetur adipisicing elit. Provident ipsam consequatur excepturi
                accusantium quos, eum et?
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Show general league stats */}
      <section className="@grid @grid-cols-3 @gap-4 @py-8 @px-12 @h-full @bg-black/60 @my-4">
        <PlayerMMRCard leagueType="Standard" rank={4} data={mmr_std_data} />
        <PlayerMMRCard leagueType="Fog" rank={23} data={mmr_fog_data} />
        <PlayerMMRCard leagueType="High Funds" rank={1456} data={mmr_hf_data} />
        <PlayerMMRCard leagueType="Live Standard" rank={4} data={mmr_std_data} />
        <PlayerMMRCard leagueType="Live Fog" rank={23} data={mmr_fog_data} />
        <PlayerMMRCard leagueType="Live High Funds" rank={1456} data={mmr_hf_data} />
      </section>
      {/* Fully shows stats for one league */}
      <section className="@pb-8 @px-12 @h-full @w-full @bg-black/60 @my-4 @space-y-4">
        <div className="@grid @grid-cols-4">
          <Select
            className="@col-span-1 @self-center @h-12"
            options={gamemodes}
            onChange={setGamemode}
            value={gamemode}
          />
          <h1 className="@col-span-3 @text-center @font-russoOne">LIVE STANDARD</h1>
        </div>
        <div className="@grid @grid-cols-12 @gap-8">
          <div className="@flex @flex-col @col-span-3">
            <h2 className="@font-russoOne @text-5xl @my-2">Rank: #1</h2>
            <p className="@font-russoOne @text-2xl">MMR: 2784</p>
            <p className="@font-russoOne @text-2xl">Max MMR: 3342</p>
            <p className="@text-xl">Last game: 06/29/2023</p>
            <br />
            <div className="@flex @flex-col @py-4 @items-center @justify-center @align-middle @w-80">
              <MMRDataTable table={table} />
            </div>
          </div>
          <div className="@flex @flex-col @h-full @p-2 @col-span-5">
            <div className="@w-full @h-full @border-primary @border-4 @bg-bg-secondary @text-center">
              GRAPH
            </div>
          </div>
          <div className="@grid @grid-rows-5 @gap-2 @h-full @col-span-4">
            <SmallMatchCard
              matchResult="W"
              player1={{ coId: { name: "grimm", version: "AWDS" }, name: "Grimm Guy" }}
              player2={{ coId: { name: "nell", version: "AWDS" }, name: "Itou Kaiji" }}
              matchLink="/"
            />
            <SmallMatchCard
              matchResult="L"
              player1={{ coId: { name: "sonja", version: "AWDS" }, name: "Itou Kaiji" }}
              player2={{ coId: { name: "grimm", version: "AWDS" }, name: "Grimm Guy" }}
              matchLink="/"
            />
            <SmallMatchCard
              matchResult="D"
              player1={{ coId: { name: "sasha", version: "AWDS" }, name: "CliveGlitch" }}
              player2={{ coId: { name: "javier", version: "AWDS" }, name: "Itou Kaiji" }}
              matchLink="/"
            />
            <SmallMatchCard
              matchResult="W"
              player1={{ coId: { name: "sonja", version: "AWDS" }, name: "Itou Kaiji" }}
              player2={{ coId: { name: "grimm", version: "AWDS" }, name: "Grimm Guy" }}
              matchLink="/"
            />
            <SmallMatchCard
              matchResult="W"
              player1={{ coId: { name: "grimm", version: "AWDS" }, name: "Grimm Guy" }}
              player2={{ coId: { name: "olaf", version: "AWDS" }, name: "Itou Kaiji" }}
              matchLink="/"
            />
          </div>
        </div>
      </section>
      <section className="@pb-8 @px-12 @h-full @w-full @bg-black/60 @my-4 @space-y-2">
        <h1 className="@col-span-3 @text-center @font-russoOne">Favorite Games</h1>
        <div className="@grid @grid-cols-4 @h-64 @gap-4">
          <div className="@w-full @h-full @border-primary @border-4 @bg-bg-tertiary">
            <p className="@text-center">GAME</p>
          </div>
          <div className="@w-full @h-full @border-primary @border-4 @bg-bg-tertiary">
            <p className="@text-center">GAME</p>
          </div>
          <div className="@w-full @h-full @border-primary @border-4 @bg-bg-tertiary">
            <p className="@text-center">GAME</p>
          </div>
          <div className="@w-full @h-full @border-primary @border-4 @bg-bg-tertiary">
            <p className="@text-center">GAME</p>
          </div>
        </div>
      </section>
    </div>
  );
}
