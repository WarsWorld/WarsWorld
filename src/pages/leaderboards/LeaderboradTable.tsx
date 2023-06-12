import { useState, useReducer } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import getTableData, { Player } from "./TableData";

type PlayerLeaderboard = {
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

const columnHelper = createColumnHelper<PlayerLeaderboard>();

const columns = [
  columnHelper.accessor("rank", {
    id: "1",
    header: () => "Rank",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("rating", {
    id: "2",
    header: () => "Rating",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("name", {
    id: "3",
    header: "Player",
    cell: (info) => <div className="@pl-2 @text-left">{info.getValue()}</div>,
  }),
  columnHelper.accessor("games", {
    id: "4",
    header: () => "Games",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("winRate", {
    id: "5",
    header: () => "Win rate",
    cell: (info) => (
      <div className="@relative">
        <div className="@text-left @pl-8 @relative @w-full @h-full @z-20">
          {info.getValue().toFixed(2)} %
        </div>
        <div
          className="@w-full @h-full @absolute @left-0 @top-0 @bg-gradient-to-r @from-red-600/80 @to-primary/80 @rounded-2xl @z-0"
          style={{ width: `${info.getValue()}%` }}
        ></div>
      </div>
    ),
  }),
  columnHelper.accessor("streak", {
    id: "6",
    header: () => "Streak",
    cell: (info) => (
      <>
        {info.getValue() > 0 ? (
          <div>{`${info.getValue()} ${info.getValue() > 10 ? "🔥" : ""}`}</div>
        ) : (
          <div className="@flex @flex-column @items-center @justify-center">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 14.375L18.526 8.6792L17.7409 9.46429L12.5 3.82069L5 6.875L0 0L3.75 10.625L11.9044 8.08506L15.0893 12.1159L14.3042 12.901L20 14.375ZM4.375 11.7395V20H0.625V12.9076L4.375 11.7395ZM19.375 15.5044V20H15.625V14.5339L19.375 15.5044ZM14.375 14.2104V20H10.625V13.2399L14.375 14.2104ZM9.375 10.1821V20H5.625V11.3502L9.375 10.1821Z"
                fill="#E7724C"
              />
            </svg>
          </div>
        )}
      </>
    ),
  }),
];

export default function LeaderboardTable() {
  const [data, setData] = useState(() => [...tableData]);
  const rerender = useReducer(() => ({}), {})[1];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="@flex @flex-col @w-full @items-center @justify-center @mb-24">
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
