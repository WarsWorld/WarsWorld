import { flexRender, Table } from "@tanstack/react-table";

interface Props {
  table: Table<any>;
  hasFooter?: boolean;
}

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
            className={row.index % 2 === 0 ? "@bg-black/40" : ""}
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
                      : flexRender(
                          header.column.columnDef.footer,
                          header.getContext()
                        )}
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
