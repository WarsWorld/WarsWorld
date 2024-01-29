/* eslint-disable @typescript-eslint/consistent-type-definitions */
import type { Table } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";

type Props = {
  // Need any or another generic type to make this component work with any table
  // regardless of what type the data has.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table: Table<any>;
  hasFooter?: boolean;
};

export default function DataTable({ table, hasFooter = false }: Props) {
  return (
    <table className="@w-full @bg-black/50 @shadow-lg @shadow-black">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr className="@bg-bg-secondary" key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                className={`@py-2 @border-b-2 @uppercase ${
                  header.index % 2 === 0 ? "@bg-bg-tertiary" : ""
                }`}
                key={header.id}
              >
                <h3 className="@font-medium">
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
          <tr className={row.index % 2 === 0 ? "@bg-black/40" : ""} key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td className="@p-2 smallscreen:@p-3 smallscreen:@pl-4 @text-center" key={cell.id}>
                <div className="@px-1 @text-[0.75em] smallscreen:@text-[1em] monitor:@text-[1.35em] large_monitor:@text-[1.5em]">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      {hasFooter && (
        <tfoot>
          {table.getFooterGroups().map((footerGroup) => (
            <tr className="@bg-bg-secondary" key={footerGroup.id}>
              {footerGroup.headers.map((header) => (
                <th
                  className={`@py-2 @border-t-2 @uppercase ${
                    header.index % 2 === 0 ? "@bg-bg-tertiary" : ""
                  }`}
                  key={header.id}
                >
                  <h3 className="@font-medium">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.footer, header.getContext())}
                  </h3>
                </th>
              ))}
            </tr>
          ))}
        </tfoot>
      )}
    </table>
  );
}
