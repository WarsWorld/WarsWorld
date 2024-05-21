import { createColumnHelper } from "@tanstack/react-table";
import type { PlayerMMR } from "pages/players/[playerName]";

const columnHelper = createColumnHelper<PlayerMMR>();

export const columns = [
  columnHelper.accessor("wins", {
    id: "W",
    header: () => "W",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("losses", {
    id: "L",
    header: () => "L",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("draws", {
    id: "D",
    header: () => "D",
    cell: (info) => info.getValue(),
  }),
];

const mmrColumn = [
  columnHelper.accessor("mmr", {
    id: "MMR",
    header: () => "MMR",
    cell: (info) => info.getValue(),
  }),
];

export const columnsWithMMR = mmrColumn.concat(columns);
