import { getCoreRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table";
import MMRDataTable from "frontend/components/player-profile/MMRDataTable";
import { columns } from "frontend/components/player-profile/MMRTableColumns";
import PlayerMMRCard from "frontend/components/player-profile/PlayerMMRCard";
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
      <section className="@flex @space-x-12 @h-full @px-12 @py-8 @bg-black/60 @my-4">
        <div className="@min-w-48 @h-48 @border-primary @border-4 @bg-bg-secondary @text-center">
          Prefered CO
        </div>
        <div className="@min-h-48 @flex @flex-col">
          <div>
            <div className="@flex @justify-between">
              <div>
                <div className="@text-4xl @font-semibold">{playerName}</div>
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
      <section className="@grid @grid-cols-3 @gap-8 @py-8 @px-12 @h-full @w-full @bg-black/60 @my-4">
        <div className="@flex @flex-col">
          <h1 className="@font-russoOne">LIVE STANDARD</h1>
          <h2 className="@font-russoOne">Rank: #1</h2>
          <p className="@font-russoOne">MMR: 2784</p>
          <p className="@font-russoOne">Max MMR: 3342</p>
          <div className="@flex @flex-col @py-4 @items-center @justify-center @align-middle @w-80">
            <MMRDataTable table={table} />
          </div>
        </div>
        <div className="@flex @flex-col @h-full @p-2">
          <div className="@w-full @h-full @border-primary @border-4 @bg-bg-secondary @text-center">
            GRAPH
          </div>
        </div>
        <div className="@grid @grid-rows-5 @gap-2 @h-full">
          <div className="@flex @bg-black/50 @text-center">
            <div className="@flex @bg-green-earth @h-full @w-20 @font-russoOne @text-4xl @align-middle @justify-center @items-center">
              <strong>W</strong>
            </div>
            <img className="@grayscale" src="\img\CO\pixelated\adder-small.png" alt="adder" />
            <img className="@scale-x-[-1]" src="\img\CO\pixelated\jake-small.png" alt="jake" />
            <p>Caustic Finale</p>
            <p>Ended: 05/21/2024</p>
          </div>
          <div className="@bg-black/50 @text-center">
            <div className="@flex @bg-orange-star @h-full @w-20 @font-russoOne @text-4xl @align-middle @justify-center @items-center">
              <strong>L</strong>
            </div>
          </div>
          <div className="@bg-black/50 @text-center">
            <div className="@flex @bg-bg-secondary @h-full @w-20 @font-russoOne @text-4xl @align-middle @justify-center @items-center">
              <strong>D</strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
