import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useSOGridTable } from '../hooks/useSOGrid';
import { SOGridHeader } from './SOGridHeader';
import { SOGridBody } from './SOGridBody';
import { SOGridPagination } from './SOGridPagination';
import type { SOGridOptions, SOGridApi } from 'so-grid-core';

export interface SOGridProps<TData> extends SOGridOptions<TData> {
  className?: string;
  style?: React.CSSProperties;
}

export interface SOGridRef<TData> {
  api: SOGridApi<TData> | null;
}

function SOGridInner<TData>(
  props: SOGridProps<TData>,
  ref: React.ForwardedRef<SOGridRef<TData>>
) {
  const {
    className,
    style,
    rowHeight = 40,
    headerHeight = 44,
    theme = 'default',
    pagination,
    serverSide,
    totalRows,
    loading,
    onRowClicked,
    onRowDoubleClicked,
    onCellClicked,
    onGridReady,
    ...options
  } = props;

  const table = useSOGridTable({ ...options, serverSide, totalRows, pagination });
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<SOGridApi<TData> | null>(null);

  // API 생성
  useEffect(() => {
    apiRef.current = {
      setRowData: (_rowData) => {
        // table.options.data 업데이트는 React 상태로 처리해야 함
        // Note: 외부에서 rowData prop을 변경해야 함
      },
      getRowData: () => options.rowData,
      getDisplayedRowCount: () => table.getRowModel().rows.length,
      getSelectedRows: () =>
        table.getSelectedRowModel().rows.map((row) => row.original),
      selectAll: () => table.toggleAllRowsSelected(true),
      deselectAll: () => table.toggleAllRowsSelected(false),
      selectRow: (rowIndex) => {
        const row = table.getRowModel().rows[rowIndex];
        row?.toggleSelected(true);
      },
      deselectRow: (rowIndex) => {
        const row = table.getRowModel().rows[rowIndex];
        row?.toggleSelected(false);
      },
      setSortModel: (sortModel) => {
        table.setSorting(
          sortModel.map((s) => ({ id: s.colId, desc: s.sort === 'desc' }))
        );
      },
      getSortModel: () =>
        table.getState().sorting.map((s) => ({
          colId: s.id,
          sort: s.desc ? 'desc' as const : 'asc' as const,
        })),
      setQuickFilter: (filterText) => table.setGlobalFilter(filterText),
      resetFilters: () => {
        table.resetGlobalFilter();
        table.resetColumnFilters();
      },
      setPage: (page) => table.setPageIndex(page),
      getPage: () => table.getState().pagination.pageIndex,
      getTotalPages: () => table.getPageCount(),
      setPageSize: (size) => table.setPageSize(size),
      setColumnVisible: (colId, visible) => {
        table.setColumnVisibility((prev) => ({ ...prev, [colId]: visible }));
      },
      setColumnPinned: (colId, pinned) => {
        table.setColumnPinning((prev) => {
          const left = prev.left?.filter((id) => id !== colId) || [];
          const right = prev.right?.filter((id) => id !== colId) || [];
          if (pinned === 'left') left.push(colId);
          if (pinned === 'right') right.push(colId);
          return { left, right };
        });
      },
      getColumnState: () =>
        table.getAllColumns().map((col) => ({
          colId: col.id,
          width: col.getSize(),
          hide: !col.getIsVisible(),
          pinned: col.getIsPinned() || false,
          sort: col.getIsSorted() || null,
          sortIndex: col.getSortIndex(),
        })),
      setColumnState: () => { },
      refreshCells: () => { },
      sizeColumnsToFit: () => { },
      exportDataAsCsv: (params) => {
        const rows = params?.onlySelected
          ? table.getSelectedRowModel().rows.map((r) => r.original)
          : options.rowData;
        const columns = options.columnDefs.filter((col) => {
          if (params?.columnKeys) {
            const colId = col.colId || String(col.field);
            return params.columnKeys.includes(colId);
          }
          return !col.hide;
        });

        const headers = columns
          .map((col) => col.headerName || String(col.field))
          .join(',');
        const csvRows = rows.map((row) =>
          columns
            .map((col) => {
              const field = col.field as keyof TData;
              const value = field ? row[field] : '';
              return `"${String(value).replace(/"/g, '""')}"`;
            })
            .join(',')
        );

        const csv = [headers, ...csvRows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = params?.fileName || 'export.csv';
        link.click();
      },
    };

    onGridReady?.(apiRef.current);
  }, [table, options.rowData, options.columnDefs, onGridReady]);

  // Ref 노출
  useImperativeHandle(ref, () => ({
    api: apiRef.current,
  }));

  const themeClass = `so-grid--${theme}`;

  return (
    <div
      ref={containerRef}
      className={`so-grid ${themeClass} ${className || ''}`}
      style={style}
    >
      <div className="so-grid__wrapper">
        <table className="so-grid__table">
          <SOGridHeader
            table={table}
            headerHeight={headerHeight}
          />
          <SOGridBody
            table={table}
            rowHeight={rowHeight}
            loading={loading}
            onRowClicked={onRowClicked}
            onRowDoubleClicked={onRowDoubleClicked}
            onCellClicked={onCellClicked}
          />
        </table>
      </div>
      {pagination && (
        <SOGridPagination
          table={table}
          pageSizeOptions={options.paginationPageSizeOptions}
          serverSide={serverSide}
          totalRows={totalRows}
          loading={loading}
        />
      )}
    </div>
  );
}

export const SOGrid = forwardRef(SOGridInner) as <TData>(
  props: SOGridProps<TData> & { ref?: React.ForwardedRef<SOGridRef<TData>> }
) => React.ReactElement;
