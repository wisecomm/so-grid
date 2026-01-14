import type { Table } from '@tanstack/react-table';

interface SOGridPaginationProps<TData> {
  table: Table<TData>;
  pageSizeOptions?: number[];
  serverSide?: boolean;
  totalRows?: number;
  loading?: boolean;
}

export function SOGridPagination<TData>({
  table,
  pageSizeOptions = [10, 20, 50, 100],
  serverSide,
  totalRows: serverTotalRows,
}: SOGridPaginationProps<TData>) {
  const {
    getState,
    setPageIndex,
    setPageSize,
    getCanPreviousPage,
    getCanNextPage,
    getPageCount,
    previousPage,
    nextPage,
  } = table;

  const { pageIndex, pageSize } = getState().pagination;
  const pageCount = getPageCount();

  // 서버 사이드 모드에서는 전달받은 totalRows 사용
  const totalRows = serverSide && serverTotalRows !== undefined
    ? serverTotalRows
    : table.getFilteredRowModel().rows.length;

  const startRow = totalRows > 0 ? pageIndex * pageSize + 1 : 0;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className="so-grid__pagination">
      <div className="so-grid__pagination-info">
        {totalRows > 0 ? (
          <span>
            {startRow} - {endRow} of {totalRows}
          </span>
        ) : (
          <span>0 rows</span>
        )}
      </div>

      <div className="so-grid__pagination-controls">
        <select
          className="so-grid__pagination-select"
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size} / page
            </option>
          ))}
        </select>

        <div className="so-grid__pagination-buttons">
          <button
            className="so-grid__pagination-btn"
            onClick={() => setPageIndex(0)}
            disabled={!getCanPreviousPage()}
            title="First page"
          >
            {'<<'}
          </button>
          <button
            className="so-grid__pagination-btn"
            onClick={() => previousPage()}
            disabled={!getCanPreviousPage()}
            title="Previous page"
          >
            {'<'}
          </button>

          <span className="so-grid__pagination-page">
            Page {pageIndex + 1} of {pageCount || 1}
          </span>

          <button
            className="so-grid__pagination-btn"
            onClick={() => nextPage()}
            disabled={!getCanNextPage()}
            title="Next page"
          >
            {'>'}
          </button>
          <button
            className="so-grid__pagination-btn"
            onClick={() => setPageIndex(pageCount - 1)}
            disabled={!getCanNextPage()}
            title="Last page"
          >
            {'>>'}
          </button>
        </div>
      </div>
    </div>
  );
}
