import { useState, useReducer, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  Table,
} from "@tanstack/react-table";
import getTableData, { Player } from "./TableData";
import { columns } from "./LeaderboardColumns";
import { useWindowWidth } from "@react-hook/window-size";

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

let rank = 1;
const requestedData: Player[] = getTableData();
const tableData = requestedData
  .sort((a, b) => {
    return b.rating - a.rating;
  })
  .map((player) => {
    return {
      id: player.id,
      rank: rank++,
      name: player.name,
      games: player.games,
      winRate: (player.wins / player.games) * 100,
      rating: player.rating,
      streak: player.streak,
    };
  });

export default function LeaderboardTable() {
  const screenWidth = useWindowWidth();
  const [columnVisibility, setColumnVisibility] = useState({});

  const [data, setData] = useState(() => [...tableData]);
  const rerender = useReducer(() => ({}), {})[1];

  const table = useReactTable({
    data,
    columns,
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
  });

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
    </div>
  );
}
