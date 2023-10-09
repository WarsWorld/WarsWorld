import SquareButton from "../layout/SquareButton";
import { Table } from "@tanstack/react-table";

interface Props {
  table: Table<any>;
}

export default function TablePagination({ table }: Props) {
  return (
    <div className="@flex @items-center @gap-2 tablet:@gap-3 @mt-8 @text-xl">
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
  );
}
