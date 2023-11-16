// Read TanStack Table documentation to understand how the
// leaderboards table is generated:
// https://tanstack.com/table/v8/docs/guide/introduction

import { useState, useEffect } from "react";
import type { Table } from "@tanstack/react-table";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { PlayerLeaderboard } from "./LeaderboardData";
import getLeaderboardData from "./LeaderboardData";
import { columns } from "./LeaderboardColumns";
import { useWindowWidth } from "@react-hook/window-size";
import DataTable from "../layout/DataTable";
import TablePagination from "../layout/TablePagination";
import type { SelectOption } from "../layout/Select";

function hideColumns(table: Table<PlayerLeaderboard>, screenWidth: number) {
  const columnsToHide = ["Games", "Win Rate", "Streak"];
  if (screenWidth <= 768) {
    table
      .getAllLeafColumns()
      .filter((column) => columnsToHide.includes(column.id))
      .map((column) => {
        column.toggleVisibility(false);
      });
  } else {
    table
      .getAllLeafColumns()
      .filter((column) => columnsToHide.includes(column.id))
      .map((column) => {
        column.toggleVisibility(true);
      });
  }
}

interface Props {
  setBestPlayers: React.Dispatch<React.SetStateAction<PlayerLeaderboard[]>>;
  gamemode: SelectOption | undefined;
  timeMode: SelectOption | undefined;
}

export default function LeaderboardTable({ setBestPlayers }: Props) {
  const screenWidth = useWindowWidth();
  const [columnVisibility, setColumnVisibility] = useState({});
  const [data, setData] = useState([] as PlayerLeaderboard[]);

  // Use this to rerender the table, probably better used for filter changes
  //const rerender = useReducer(() => ({}), {})[1];

  const table = useReactTable({
    data,
    columns,
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => {
    const requestedData = getLeaderboardData(550);
    setBestPlayers(requestedData.filter((player) => player.rank <= 6));
    setData(requestedData);
    // Set the amount of rows the table has for each page
    table.setPageSize(100);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // makes the table more responsive by removing and adding columns
  useEffect(() => hideColumns(table, screenWidth), [screenWidth, table]);

  return (
    <div className="@flex @flex-col @w-full @items-center @justify-center @mb-12 smallscreen:@mb-20 @min-w-[90vw] tablet:@min-w-[80vw]">
      <DataTable table={table} />
      <TablePagination table={table} />
    </div>
  );
}
