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
  // 그리드 레벨 sortable 옵션을 defaultColDef에 기본값으로 병합
  const effectiveDefaultColDef = useMemo(() => ({
    sortable: options.sortable, // 그리드 옵션을 기본값으로 사용
    ...options.defaultColDef,   // 사용자의 defaultColDef가 우선
  }), [options.sortable, options.defaultColDef]);

  const columns = useMemo(
    () => mapColumnDefs(options.columnDefs, effectiveDefaultColDef),
    [options.columnDefs, effectiveDefaultColDef]
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

  // Controlled sorting state
  const [sorting, setSorting] = useState<any[]>([]);

  // Table ref to avoid circular dependency in options
  const tableRef = useRef<Table<TData>>();

  const tableOptions = useMemo(() => ({
    debugTable: true,
    data: options.rowData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // 정렬 모델은 항상 활성화하고, 컬럼 레벨에서 제어
    getSortedRowModel: !isServerSide ? getSortedRowModel() : undefined,
    getFilteredRowModel: !isServerSide && options.filterable !== false ? getFilteredRowModel() : undefined,
    getPaginationRowModel: options.pagination ? getPaginationRowModel() : undefined,
    enableRowSelection: options.rowSelection !== false,
    enableMultiRowSelection: options.rowSelection === 'multiple',
    // 그리드 레벨 기본값 (컬럼 레벨에서 오버라이드 가능)
    enableSorting: true, // 항상 true로 두고 컬럼 레벨에서 제어
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
      sorting,
    },
    // Pagination change handler
    onPaginationChange: (updater: any) => {
      const newPagination = typeof updater === 'function'
        ? updater(pagination)
        : updater;

      setPagination(newPagination);

      if (isServerSide && options.onPaginationChange) {
        options.onPaginationChange(newPagination);
      }
    },

    onSortingChange: (updater: any) => {
      const oldState = sorting;
      const newState = typeof updater === 'function' ? updater(oldState) : updater;

      setSorting(newState);

      if (isServerSide && options.onSortChange) {
        options.onSortChange(
          newState.map((s: any) => ({
            colId: s.id,
            sort: s.desc ? 'desc' as const : 'asc' as const,
          }))
        );
      }
    },
  }), [
    options.rowData,
    columns,
    isServerSide,
    options.sortable,
    options.filterable,
    options.rowSelection,
    options.multiSort,
    pageCount,
    pagination,
    sorting, // Sorting state dependency
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
