import { useState, useReducer, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  Table,
} from "@tanstack/react-table";
import getTableData, { Player } from "./TableData";
import { columns } from "./LeaderboardColumns";
import { useWindowWidth } from "@react-hook/window-size";
import PaginationButton from "../layout/PaginationButton";

function hideColumns(table: Table<PlayerLeaderboard>, screenWidth: number) {
  const columnsToHide = [4, 5, 6];
  if (screenWidth <= 768) {
    table
      .getAllLeafColumns()
      .filter((column) => columnsToHide.includes(Number(column.id)))
      .map((column) => {
        column.toggleVisibility(false);
      });
  } else {
    table
      .getAllLeafColumns()
      .filter((column) => columnsToHide.includes(Number(column.id)))
      .map((column) => {
        column.toggleVisibility(true);
      });
  }
}

export type PlayerLeaderboard = {
  id: string;
  rank: number;
  name: string;
  games: number;
  winRate: number;
  rating: number;
  streak: number;
};

function getData(amount: number): PlayerLeaderboard[] {
  let rank = 1;
  const requestedData: Player[] = getTableData(amount);

  const transformedData = requestedData
    .sort((a, b) => {
      return b.rating - a.rating;
    })
    .map((player) => {
      const result: PlayerLeaderboard = {
        id: player.id,
        rank: rank++,
        name: player.name,
        games: player.games,
        winRate: (player.wins / player.games) * 100,
        rating: player.rating,
        streak: player.streak,
      };
      return result;
    });

  return transformedData;
}

export default function LeaderboardTable() {
  const screenWidth = useWindowWidth();
  const [columnVisibility, setColumnVisibility] = useState({});
  const [data, setData] = useState([] as PlayerLeaderboard[]);

  const rerender = useReducer(() => ({}), {})[1];

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

  useEffect(() => setData(getData(500)), []);
  // Set the max amount of rows every single page has
  useEffect(() => table.setPageSize(100), [table]);
  // makes the table more responsive by removing and adding columns
  useEffect(() => hideColumns(table, screenWidth), [screenWidth, table]);

  return (
    <div className="@flex @flex-col @w-full @items-center @justify-center @mb-20">
      <table className="@min-w-[80vw] @bg-black/50 @shadow-lg @shadow-black">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr className="@bg-bg-secondary" key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  className={`@py-2 @border-b-2 @uppercase ${
                    Number(header.id) % 2 === 0 ? "@bg-bg-tertiary" : ""
                  }`}
                  key={header.id}
                >
                  <h3 className="@font-medium">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </h3>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              className={Number(row.id) % 2 === 0 ? "@bg-black/40" : ""}
              key={row.id}
            >
              {row.getVisibleCells().map((cell) => (
                <td className="@p-3 @pl-4 @text-center" key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="@flex @items-center @gap-3 @mt-8">
        <PaginationButton
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {"<<"}
        </PaginationButton>
        <PaginationButton
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          {"<"}
        </PaginationButton>
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
        <PaginationButton
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          {">"}
        </PaginationButton>
        <PaginationButton
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {">>"}
        </PaginationButton>
      </div>
    </div>
  );
}
