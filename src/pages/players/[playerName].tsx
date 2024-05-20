import { getCoreRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table";
import DataTable from "frontend/components/layout/table/DataTable";
import { columns } from "frontend/components/player-profile/MMRTableColumns";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export type PlayerMMR = {
  leagueType: string;
  topMmr: number;
  mmr: number;
  wins: number;
  losses: number;
  draws: number;
};

const playerMMRArray: PlayerMMR[] = [
  {
    leagueType: "STD",
    topMmr: 3000,
    mmr: 2800,
    wins: 50,
    losses: 30,
    draws: 5,
  },
  {
    leagueType: "FOG",
    topMmr: 3200,
    mmr: 3100,
    wins: 60,
    losses: 20,
    draws: 10,
  },
  {
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
  const [data, setData] = useState([] as PlayerMMR[]);

  useEffect(() => {
    setData(playerMMRArray.filter((item) => item.leagueType === "STD"));
  }, []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const playerName = query?.playerName;

  return (
    <div className="@w-[90vw] @space-y-4 @my-8">
      <section className="@flex @space-x-12 @h-full @p-12 @bg-black/60">
        <div className="@min-w-56 @h-56 @border-primary @border-4 @bg-bg-secondary"></div>
        <div className="@min-h-48 @flex @flex-col">
          <div>
            <div className="@flex @justify-between">
              <div>
                <div className="@text-4xl @font-semibold">{playerName}</div>
                <div className="@text-gray-500">Real Name</div>
              </div>
              <div className="@flex @h-6 @space-x-2 @items-center">
                <div className="@bg-green-earth @h-6 @w-6 @rounded-full"></div>
                <div className="@text-xl">Online</div>
              </div>
            </div>
            <div className="@pt-6 @text-lg">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quaerat, sed recusandae,
              perspiciatis libero minima porro ut quisquam alias vero ratione reiciendis optio
              voluptates totam dolor soluta enim repellendus asperiores voluptatum.
              <br />
              <br />
              Lorem ipsum dolor sit amet, consectetur adipisicing elit. Provident ipsam consequatur
              excepturi accusantium quos, eum et?
            </div>
          </div>
        </div>
      </section>
      <section className="@flex @space-x-12 @p-12 @h-96 @bg-black/60">
        <div className="@flex @flex-col @items-center @justify-center @w-72">
          <div className="@w-full @bg-primary @py-2 @border-b-2 @text-center @uppercase">
            <h3 className="@font-medium">STD</h3>
          </div>
          <DataTable table={table} />
        </div>
        <div className="@flex @flex-col @items-center @justify-center @w-72">
          <div className="@w-full @bg-primary @py-2 @border-b-2 @text-center @uppercase">
            <h3 className="@font-medium">FOG</h3>
          </div>
          <DataTable table={table} />
        </div>
        <div className="@flex @flex-col @items-center @justify-center @w-72">
          <div className="@w-full @bg-primary @py-2 @border-b-2 @text-center @uppercase">
            <h3 className="@font-medium">HF</h3>
          </div>
          <DataTable table={table} />
        </div>
      </section>
      <section className="@flex @space-x-12 @p-12 @h-96 @bg-black/60"></section>
    </div>
  );
}
