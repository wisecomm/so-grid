// Core
export { SOGridCore, createSOGrid } from './core/gridCore';
export { mapColumnDefs, getColumnId, flattenColumns } from './core/columnMapper';

// Types
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
} from './types';

// Utils
export {
  isNil,
  deepMerge,
  isObject,
  isArray,
  generateId,
  debounce,
  throttle,
  classNames,
} from './utils';

// Re-export useful TanStack Table types
export type {
  ColumnDef,
  Table,
  Row,
  Cell,
  Header,
  HeaderGroup,
  SortingState,
  RowSelectionState,
  PaginationState,
  ColumnPinningState,
  VisibilityState,
} from '@tanstack/table-core';
