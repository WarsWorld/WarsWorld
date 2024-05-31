import type { Table } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";

type Props = {
  // Need any or another generic type to make this component work with any table
  // regardless of what type the data has.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: Table<any>;
};

const TableHeaderColorsWithMMR: Record<number, string> = {
  0: "@bg-primary @text-white",
  1: "@bg-black/80 @text-green-earth",
  2: "@bg-black/80 @text-orange-star",
  3: "@bg-black/80 @text-bg-tertiary",
};

const TableHeaderColors: Record<number, string> = {
  0: "@bg-black/80 @text-green-earth",
  1: "@bg-black/80 @text-orange-star",
  2: "@bg-black/80 @text-bg-tertiary",
};

export default function MMRDataTable({ table }: Props) {
  return (
    <table className="@w-full @bg-black/50 @shadow-lg @shadow-black @rounded-lg @overflow-hidden">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                className={`@py-2 @uppercase @min-w-16 ${
                  headerGroup.headers[0].id === "MMR"
                    ? TableHeaderColorsWithMMR[header.index]
                    : TableHeaderColors[header.index]
                }
                ${header.column.id === "MMR" && "@border-r-4"}`}
                key={header.id}
              >
                <h3 className="@font-russoOne @text-lg">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </h3>
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td
                className={`@p-1 monitor:@p-2 @text-center ${
                  cell.id === "0_MMR" ? "@bg-bg-secondary @border-r-4" : ""
                }`}
                key={cell.id}
              >
                <div className={`@px-1 @text-lg`}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
