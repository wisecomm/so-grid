import type { ColumnDef } from '@tanstack/table-core';
import type { SOColumnDef } from '../types';

/**
 * SO-Grid 컬럼 정의를 TanStack Table 컬럼 정의로 변환
 */
export function mapColumnDefs<TData>(
  soColumns: SOColumnDef<TData>[],
  defaultColDef?: Partial<SOColumnDef<TData>>
): ColumnDef<TData, unknown>[] {
  return soColumns.map((soCol) => mapSingleColumn(soCol, defaultColDef));
}

function mapSingleColumn<TData>(
  soCol: SOColumnDef<TData>,
  defaultColDef?: Partial<SOColumnDef<TData>>
): ColumnDef<TData, unknown> {
  const mergedCol = { ...defaultColDef, ...soCol };

  const colId = mergedCol.colId || String(mergedCol.field) || '';

  // 그룹 컬럼 처리
  if (mergedCol.children && mergedCol.children.length > 0) {
    return {
      id: colId,
      header: mergedCol.headerName || colId,
      columns: mapColumnDefs(mergedCol.children, defaultColDef),
    };
  }

  // accessor 설정에 따라 다른 컬럼 구조 생성
  if (mergedCol.valueGetter) {
    return {
      id: colId,
      header: mergedCol.headerName || String(mergedCol.field) || colId,
      accessorFn: (row: TData) => {
        return mergedCol.valueGetter!({
          data: row,
          colDef: mergedCol,
        });
      },
      enableSorting: mergedCol.sortable === true,
      enableColumnFilter: mergedCol.filterable !== false,
      enableResizing: mergedCol.resizable !== false,
      enableHiding: !mergedCol.lockVisible,
      size: mergedCol.width,
      minSize: mergedCol.minWidth,
      maxSize: mergedCol.maxWidth,
      meta: {
        soColDef: mergedCol,
        flex: mergedCol.flex,
        cellRenderer: mergedCol.cellRenderer,
        headerRenderer: mergedCol.headerRenderer,
        valueFormatter: mergedCol.valueFormatter,
        cellClass: mergedCol.cellClass,
        headerClass: mergedCol.headerClass,
        editable: mergedCol.editable,
        cellEditor: mergedCol.cellEditor,
        cellStyle: mergedCol.cellStyle,
        headerStyle: mergedCol.headerStyle,
      },
    };
  }

  if (mergedCol.field) {
    return {
      id: colId,
      header: mergedCol.headerName || String(mergedCol.field) || colId,
      accessorKey: mergedCol.field as string,
      enableSorting: mergedCol.sortable === true,
      enableColumnFilter: mergedCol.filterable !== false,
      enableResizing: mergedCol.resizable !== false,
      enableHiding: !mergedCol.lockVisible,
      size: mergedCol.width,
      minSize: mergedCol.minWidth,
      maxSize: mergedCol.maxWidth,
      meta: {
        soColDef: mergedCol,
        flex: mergedCol.flex,
        cellRenderer: mergedCol.cellRenderer,
        headerRenderer: mergedCol.headerRenderer,
        valueFormatter: mergedCol.valueFormatter,
        cellClass: mergedCol.cellClass,
        headerClass: mergedCol.headerClass,
        editable: mergedCol.editable,
        cellEditor: mergedCol.cellEditor,
        cellStyle: mergedCol.cellStyle,
        headerStyle: mergedCol.headerStyle,
      },
    };
  }

  // 기본 display 컬럼
  return {
    id: colId,
    header: mergedCol.headerName || colId,
    enableSorting: mergedCol.sortable === true,
    enableColumnFilter: mergedCol.filterable !== false,
    enableResizing: mergedCol.resizable !== false,
    enableHiding: !mergedCol.lockVisible,
    size: mergedCol.width,
    minSize: mergedCol.minWidth,
    maxSize: mergedCol.maxWidth,
    meta: {
      soColDef: mergedCol,
      flex: mergedCol.flex,
      cellRenderer: mergedCol.cellRenderer,
      headerRenderer: mergedCol.headerRenderer,
      valueFormatter: mergedCol.valueFormatter,
      cellClass: mergedCol.cellClass,
      headerClass: mergedCol.headerClass,
      editable: mergedCol.editable,
      cellEditor: mergedCol.cellEditor,
      cellStyle: mergedCol.cellStyle,
      headerStyle: mergedCol.headerStyle,
    },
  };
}

/**
 * 컬럼 ID 추출
 */
export function getColumnId<TData>(colDef: SOColumnDef<TData>): string {
  return colDef.colId || String(colDef.field) || '';
}

/**
 * 플랫 컬럼 리스트로 변환 (그룹 해제)
 */
export function flattenColumns<TData>(
  columns: SOColumnDef<TData>[]
): SOColumnDef<TData>[] {
  const result: SOColumnDef<TData>[] = [];

  function flatten(cols: SOColumnDef<TData>[]) {
    for (const col of cols) {
      if (col.children && col.children.length > 0) {
        flatten(col.children);
      } else {
        result.push(col);
      }
    }
  }

  flatten(columns);
  return result;
}
