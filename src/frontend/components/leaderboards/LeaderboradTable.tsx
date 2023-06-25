// Read TanStack Table documentation to understand how the
// leaderboards table is generated:
// https://tanstack.com/table/v8/docs/guide/introduction

import { useState, useReducer, useEffect } from "react";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  Table,
} from "@tanstack/react-table";
import getLeaderboardData, { PlayerLeaderboard } from "./LeaderboardData";
import { columns } from "./LeaderboardColumns";
import { useWindowWidth } from "@react-hook/window-size";
import SquareButton from "../layout/SquareButton";
import DataTable from "../layout/DataTable";

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

export default function LeaderboardTable() {
  const screenWidth = useWindowWidth();
  const [columnVisibility, setColumnVisibility] = useState({});
  const [data, setData] = useState([] as PlayerLeaderboard[]);

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

  useEffect(() => setData(getLeaderboardData(500)), []);
  // Set the max amount of rows every single page has
  useEffect(() => table.setPageSize(100), [table]);
  // makes the table more responsive by removing and adding columns
  useEffect(() => hideColumns(table, screenWidth), [screenWidth, table]);

  return (
    <div className="@flex @flex-col @w-full @items-center @justify-center @mb-20 @min-w-[80vw]">
      <DataTable table={table} />
      <div className="@flex @items-center @gap-3 @mt-8">
        <SquareButton
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {"<<"}
        </SquareButton>
        <SquareButton
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {"<"}
        </SquareButton>
        <input
          type="number"
          max={table.getPageCount()}
          value={table.getState().pagination.pageIndex + 1}
          onChange={(e) => {
            const page = e.target.value ? Number(e.target.value) - 1 : 0;
            page < table.getPageCount() && table.setPageIndex(page);
          }}
          className="@border-none @py-2 @px-4 @rounded @w-16 @shadow-black/50 @shadow-md @bg-bg-tertiary @text-white @text-center @font-semibold
          [appearance:textfield] [&::-webkit-outer-spin-button]:@appearance-none [&::-webkit-inner-spin-button]:@appearance-none"
        />
        <SquareButton
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {">"}
        </SquareButton>
        <SquareButton
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {">>"}
        </SquareButton>
      </div>
    </div>
  );
}
