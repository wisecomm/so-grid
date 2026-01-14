import { useMemo, useRef, useSyncExternalStore, useCallback, useEffect, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type Table,
} from '@tanstack/react-table';
import {
  createSOGrid,
  mapColumnDefs,
  type SOGridOptions,
  type SOGridApi,
  type SOGridCore,
} from 'so-grid-core';

export interface UseSOGridReturn<TData> {
  gridCore: SOGridCore<TData>;
  api: SOGridApi<TData>;
}

export function useSOGrid<TData>(
  options: SOGridOptions<TData>
): UseSOGridReturn<TData> {
  const gridCoreRef = useRef<SOGridCore<TData> | null>(null);
  const apiRef = useRef<SOGridApi<TData> | null>(null);

  // Grid Core 초기화
  if (!gridCoreRef.current) {
    gridCoreRef.current = createSOGrid(options);
    apiRef.current = gridCoreRef.current.createApi();
  }

  // 상태 구독 (리렌더링 트리거용)
  useSyncExternalStore(
    useCallback(
      (callback) => gridCoreRef.current!.subscribe(callback),
      []
    ),
    () => gridCoreRef.current!.getState(),
    () => gridCoreRef.current!.getState()
  );

  // 옵션 변경 시 업데이트
  useEffect(() => {
    if (gridCoreRef.current && apiRef.current) {
      apiRef.current.setRowData(options.rowData);
    }
  }, [options.rowData]);

  // Grid Ready 콜백
  useEffect(() => {
    if (apiRef.current && options.onGridReady) {
      options.onGridReady(apiRef.current);
    }
  }, []);

  return {
    gridCore: gridCoreRef.current,
    api: apiRef.current!,
  };
}

/**
 * TanStack React Table을 직접 사용하는 훅
 */
export function useSOGridTable<TData>(options: SOGridOptions<TData>) {
  // console.log('useSOGridTable options:', options);
  const columns = useMemo(
    () => mapColumnDefs(options.columnDefs, options.defaultColDef),
    [options.columnDefs, options.defaultColDef]
  );

  const isServerSide = options.serverSide === true;
  const pageSize = options.paginationPageSize || 10;

  // 서버 사이드 모드: 총 페이지 수 계산
  const pageCount = isServerSide && options.totalRows
    ? Math.ceil(options.totalRows / pageSize)
    : undefined;

  // Controlled pagination state
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize,
  });

  // Table ref to avoid circular dependency in options
  const tableRef = useRef<Table<TData>>();

  const tableOptions = useMemo(() => ({
    debugTable: true,
    data: options.rowData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // 서버 사이드 모드에서는 클라이언트 정렬/필터링/페이지네이션 비활성화
    getSortedRowModel: !isServerSide && options.sortable !== false ? getSortedRowModel() : undefined,
    getFilteredRowModel: !isServerSide && options.filterable !== false ? getFilteredRowModel() : undefined,
    getPaginationRowModel: options.pagination ? getPaginationRowModel() : undefined,
    enableRowSelection: options.rowSelection !== false,
    enableMultiRowSelection: options.rowSelection === 'multiple',
    enableSorting: options.sortable !== false,
    enableMultiSort: options.multiSort !== false,
    enableColumnPinning: true,
    enableColumnResizing: true,
    // 서버 사이드 모드 설정
    manualPagination: isServerSide,
    manualSorting: isServerSide,
    manualFiltering: isServerSide,
    pageCount: pageCount,
    autoResetPageIndex: false,
    state: {
      pagination,
    },
    // Pagination change handler
    onPaginationChange: (updater: any) => {
      const newPagination = typeof updater === 'function'
        ? updater(pagination)
        : updater;

      setPagination(newPagination);

      if (isServerSide && options.onPaginationChange) {
        options.onPaginationChange({
          page: newPagination.pageIndex,
          pageSize: newPagination.pageSize,
          startRow: newPagination.pageIndex * newPagination.pageSize,
          endRow: (newPagination.pageIndex + 1) * newPagination.pageSize,
        });
      }
    },

    onSortingChange: isServerSide ? (updater: any) => {
      const table = tableRef.current;
      if (!table) return;

      const oldState = table.getState().sorting;
      const newState = typeof updater === 'function' ? updater(oldState) : updater;

      if (options.onSortChange) {
        options.onSortChange(
          newState.map((s: any) => ({
            colId: s.id,
            sort: s.desc ? 'desc' as const : 'asc' as const,
          }))
        );
      }
    } : undefined,
  }), [
    options.rowData,
    columns,
    isServerSide,
    options.sortable,
    options.filterable,
    options.rowSelection,
    options.multiSort,
    pageCount,
    pagination, // Dependency on local state
    // options.onPaginationChange/onSortChange are omitted for stability, standard practice when they might be inline functions
  ]);

  const table = useReactTable(tableOptions);

  // Update ref
  tableRef.current = table;

  // 페이지 사이즈 변경 (External prop change)
  useEffect(() => {
    if (pageSize) {
      setPagination(prev => ({ ...prev, pageSize }));
    }
  }, [pageSize]);

  return table;
}
