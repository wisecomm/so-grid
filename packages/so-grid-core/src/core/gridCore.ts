import {
  createTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type Table,
  type SortingState,
  type ColumnPinningState,
  type VisibilityState,
} from '@tanstack/table-core';
import { mapColumnDefs } from './columnMapper';
import type {
  SOGridOptions,
  SOGridApi,
  SortModel,
  ColumnState,
  GridState,
  ExportParams,
} from '../types';

/**
 * SO-Grid 코어 클래스
 * TanStack Table을 래핑하여 AG-Grid 스타일 API 제공
 */
export class SOGridCore<TData> {
  private table: Table<TData>;
  private options: SOGridOptions<TData>;
  private state: GridState;
  private listeners: Set<() => void> = new Set();

  constructor(options: SOGridOptions<TData>) {
    this.options = options;
    this.state = this.initializeState();
    this.table = this.createTableInstance();
  }

  private initializeState(): GridState {
    const { defaultSortModel, paginationPageSize, columnPinning } =
      this.options;

    return {
      sorting: defaultSortModel
        ? defaultSortModel.map((s) => ({ id: s.colId, desc: s.sort === 'desc' }))
        : [],
      rowSelection: {},
      pagination: {
        pageIndex: 0,
        pageSize: paginationPageSize || 10,
      },
      columnPinning: columnPinning || { left: [], right: [] },
      columnVisibility: this.getInitialVisibility(),
      globalFilter: this.options.quickFilterText || '',
    };
  }

  private getInitialVisibility(): VisibilityState {
    const visibility: VisibilityState = {};
    for (const col of this.options.columnDefs) {
      if (col.hide) {
        const colId = col.colId || String(col.field);
        visibility[colId] = false;
      }
    }
    return visibility;
  }

  private createTableInstance(): Table<TData> {
    const columns = mapColumnDefs(
      this.options.columnDefs,
      this.options.defaultColDef
    );

    return createTable({
      data: this.options.rowData,
      columns,
      state: {
        sorting: this.state.sorting,
        rowSelection: this.state.rowSelection,
        pagination: this.state.pagination,
        columnPinning: this.state.columnPinning,
        columnVisibility: this.state.columnVisibility,
        globalFilter: this.state.globalFilter,
      },
      onStateChange: () => {
        // TanStack Table 상태 변경 처리
      },
      renderFallbackValue: null,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: this.options.sortable !== false ? getSortedRowModel() : undefined,
      getFilteredRowModel: this.options.filterable !== false ? getFilteredRowModel() : undefined,
      getPaginationRowModel: this.options.pagination ? getPaginationRowModel() : undefined,
      enableRowSelection: this.options.rowSelection !== false,
      enableMultiRowSelection: this.options.rowSelection === 'multiple',
      enableSorting: this.options.sortable !== false,
      enableMultiSort: this.options.multiSort !== false,
      enableFilters: this.options.filterable !== false,
      enableColumnPinning: true,
      enableColumnResizing: true,
      manualPagination: false,
      onSortingChange: (updater) => {
        this.state.sorting =
          typeof updater === 'function' ? updater(this.state.sorting) : updater;
        this.notifyListeners();
      },
      onRowSelectionChange: (updater) => {
        this.state.rowSelection =
          typeof updater === 'function'
            ? updater(this.state.rowSelection)
            : updater;
        this.options.onSelectionChanged?.(this.getSelectedRows());
        this.notifyListeners();
      },
      onPaginationChange: (updater) => {
        this.state.pagination =
          typeof updater === 'function'
            ? updater(this.state.pagination)
            : updater;
        this.notifyListeners();
      },
      onColumnPinningChange: (updater) => {
        this.state.columnPinning =
          typeof updater === 'function'
            ? updater(this.state.columnPinning)
            : updater;
        this.notifyListeners();
      },
      onColumnVisibilityChange: (updater) => {
        this.state.columnVisibility =
          typeof updater === 'function'
            ? updater(this.state.columnVisibility)
            : updater;
        this.notifyListeners();
      },
      onGlobalFilterChange: (updater) => {
        this.state.globalFilter =
          typeof updater === 'function'
            ? updater(this.state.globalFilter)
            : updater;
        this.notifyListeners();
      },
    });
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * 상태 변경 리스너 등록
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * TanStack Table 인스턴스 반환
   */
  getTable(): Table<TData> {
    return this.table;
  }

  /**
   * 현재 상태 반환
   */
  getState(): GridState {
    return this.state;
  }

  /**
   * 옵션 반환
   */
  getOptions(): SOGridOptions<TData> {
    return this.options;
  }

  /**
   * 선택된 행 반환
   */
  getSelectedRows(): TData[] {
    return this.table.getSelectedRowModel().rows.map((row) => row.original);
  }

  /**
   * API 객체 생성
   */
  createApi(): SOGridApi<TData> {
    return {
      // 데이터
      setRowData: (rowData: TData[]) => {
        this.options.rowData = rowData;
        this.table = this.createTableInstance();
        this.notifyListeners();
      },
      getRowData: () => this.options.rowData,
      getDisplayedRowCount: () => this.table.getRowModel().rows.length,

      // 선택
      getSelectedRows: () => this.getSelectedRows(),
      selectAll: () => this.table.toggleAllRowsSelected(true),
      deselectAll: () => this.table.toggleAllRowsSelected(false),
      selectRow: (rowIndex: number) => {
        const row = this.table.getRowModel().rows[rowIndex];
        row?.toggleSelected(true);
      },
      deselectRow: (rowIndex: number) => {
        const row = this.table.getRowModel().rows[rowIndex];
        row?.toggleSelected(false);
      },

      // 정렬
      setSortModel: (sortModel: SortModel[]) => {
        this.state.sorting = sortModel.map((s) => ({
          id: s.colId,
          desc: s.sort === 'desc',
        }));
        this.notifyListeners();
      },
      getSortModel: () =>
        this.state.sorting.map((s: { id: string; desc: boolean }) => ({
          colId: s.id,
          sort: s.desc ? 'desc' : 'asc',
        })),

      // 필터
      setQuickFilter: (filterText: string) => {
        this.state.globalFilter = filterText;
        this.table.setGlobalFilter(filterText);
        this.notifyListeners();
      },
      resetFilters: () => {
        this.state.globalFilter = '';
        this.table.resetGlobalFilter();
        this.table.resetColumnFilters();
        this.notifyListeners();
      },

      // 페이지네이션
      setPage: (page: number) => {
        this.state.pagination.pageIndex = page;
        this.table.setPageIndex(page);
        this.notifyListeners();
      },
      getPage: () => this.state.pagination.pageIndex,
      getTotalPages: () => this.table.getPageCount(),
      setPageSize: (size: number) => {
        this.state.pagination.pageSize = size;
        this.table.setPageSize(size);
        this.notifyListeners();
      },

      // 컬럼
      setColumnVisible: (colId: string, visible: boolean) => {
        this.state.columnVisibility[colId] = visible;
        this.table.setColumnVisibility(this.state.columnVisibility);
        this.notifyListeners();
      },
      setColumnPinned: (colId: string, pinned: 'left' | 'right' | false) => {
        const left = this.state.columnPinning.left?.filter((id: string) => id !== colId) || [];
        const right = this.state.columnPinning.right?.filter((id: string) => id !== colId) || [];

        if (pinned === 'left') {
          left.push(colId);
        } else if (pinned === 'right') {
          right.push(colId);
        }

        this.state.columnPinning = { left, right };
        this.table.setColumnPinning(this.state.columnPinning);
        this.notifyListeners();
      },
      getColumnState: (): ColumnState[] => {
        return this.table.getAllColumns().map((col) => ({
          colId: col.id,
          width: col.getSize(),
          hide: !col.getIsVisible(),
          pinned: col.getIsPinned() || false,
          sort: col.getIsSorted() || null,
          sortIndex: col.getSortIndex(),
        }));
      },
      setColumnState: (state: ColumnState[]) => {
        const visibility: VisibilityState = {};
        const pinning: ColumnPinningState = { left: [], right: [] };
        const sorting: SortingState = [];

        for (const col of state) {
          if (col.hide !== undefined) {
            visibility[col.colId] = !col.hide;
          }
          if (col.pinned === 'left') {
            pinning.left!.push(col.colId);
          } else if (col.pinned === 'right') {
            pinning.right!.push(col.colId);
          }
          if (col.sort) {
            sorting.push({ id: col.colId, desc: col.sort === 'desc' });
          }
        }

        this.state.columnVisibility = visibility;
        this.state.columnPinning = pinning;
        this.state.sorting = sorting;
        this.notifyListeners();
      },

      // 유틸
      refreshCells: () => {
        this.notifyListeners();
      },
      sizeColumnsToFit: () => {
        // 구현은 React 컴포넌트에서 처리
        this.notifyListeners();
      },
      exportDataAsCsv: (params?: ExportParams) => {
        const rows = params?.onlySelected
          ? this.getSelectedRows()
          : this.options.rowData;
        const columns = this.options.columnDefs.filter((col) => {
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
  }
}

/**
 * SO-Grid 코어 인스턴스 생성
 */
export function createSOGrid<TData>(
  options: SOGridOptions<TData>
): SOGridCore<TData> {
  return new SOGridCore(options);
}
