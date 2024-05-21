import { getCoreRowModel, getPaginationRowModel, useReactTable } from "@tanstack/react-table";
import { columnsWithMMR } from "frontend/components/player-profile/MMRTableColumns";
import type { PlayerMMR } from "pages/players/[playerName]";
import MMRDataTable from "./MMRDataTable";

type Props = {
  leagueType: string;
  data: PlayerMMR[];
  rank: number;
};

export default function PlayerMMRCard({ data, leagueType, rank }: Props) {
  const table = useReactTable({
    data,
    columns: columnsWithMMR,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="@flex @flex-col @items-center @justify-center @align-middle @w-full">
      <div className="@flex @flex-col @items-center @justify-center @align-middle @w-80">
        <div className="@w-full @py-2 @text-center @uppercase">
          <h3 className="@font-russoOne">{leagueType}</h3>
        </div>
        <MMRDataTable table={table} />
        <div className="@w-full @py-2 @text-center">
          <p>Rank: #{rank}</p>
        </div>
      </div>
    </div>
  );
}
