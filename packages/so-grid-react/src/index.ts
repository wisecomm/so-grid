// Components
export { SOGrid } from './components/SOGrid';
export type { SOGridProps, SOGridRef } from './components/SOGrid';
export { SOGridHeader } from './components/SOGridHeader';
export { SOGridBody } from './components/SOGridBody';
export { SOGridPagination } from './components/SOGridPagination';

// Hooks
export { useSOGrid, useSOGridTable } from './hooks/useSOGrid';
export type { UseSOGridReturn } from './hooks/useSOGrid';

// Re-export from core
export {
  createSOGrid,
  mapColumnDefs,
  getColumnId,
  flattenColumns,
  classNames,
  debounce,
  throttle,
  generateId,
} from 'so-grid-core';

// Re-export types from core
export type {
  SOGridOptions,
  SOColumnDef,
  SOGridApi,
  SortModel,
  ColumnState,
  GridState,
  ExportParams,
  CellRenderer,
  HeaderRenderer,
  ValueFormatter,
  ValueGetter,
  CellEditor,
  CellRendererParams,
  HeaderRendererParams,
  ValueFormatterParams,
  ValueGetterParams,
  CellEditorParams,
  CellClassParams,
  RowClickedEvent,
  CellClickedEvent,
  // Server-side types
  PaginationChangeParams,
  FilterModel,
  FilterCondition,
  ServerSideRequest,
  ServerSideResponse,
} from 'so-grid-core';

// Re-export TanStack Table utilities
export { flexRender } from '@tanstack/react-table';
