import type {
  SortingState,
  RowSelectionState,
  PaginationState,
  ColumnPinningState,
  VisibilityState,
} from '@tanstack/table-core';

export type {
  SortingState,
  RowSelectionState,
  PaginationState,
  ColumnPinningState,
  VisibilityState,
};

// Grid Options - AG-Grid 스타일 API
export interface SOGridOptions<TData> {
  // 데이터
  rowData: TData[];
  columnDefs: SOColumnDef<TData>[];

  // 정렬
  sortable?: boolean;
  multiSort?: boolean;
  defaultSortModel?: SortModel[];

  // 필터링
  filterable?: boolean;
  quickFilterText?: string;

  // 선택
  rowSelection?: 'single' | 'multiple' | false;
  onSelectionChanged?: (selectedRows: TData[]) => void;

  // 페이지네이션
  pagination?: boolean;
  paginationPageSize?: number;
  paginationPageSizeOptions?: number[];
  /** 페이지 변경 시 스크롤 위치 유지 (AG-Grid: suppressScrollOnNewData) */
  suppressScrollOnNewData?: boolean;
  /** 컨테이너 높이에 맞춰 페이지 크기 자동 계산 (AG-Grid: paginationAutoPageSize) */
  paginationAutoPageSize?: boolean;
  /** 데이터 변경, 필터링, 정렬 시 페이지를 자동으로 1페이지로 리셋할지 여부 (Default: true) */
  autoResetPageIndex?: boolean;
  /** 현재 페이지 인덱스 (0-based) - 제어 컴포넌트용 */
  pageIndex?: number;

  // 서버 사이드 모드
  serverSide?: boolean;
  totalRows?: number;
  loading?: boolean;
  onPaginationChange?: (params: PaginationState) => void;
  onSortChange?: (sortModel: SortModel[]) => void;
  onFilterChange?: (filterModel: FilterModel) => void;

  // 컬럼
  defaultColDef?: Partial<SOColumnDef<TData>>;
  columnPinning?: ColumnPinningState;

  // 스타일
  rowHeight?: number;
  headerHeight?: number;
  theme?: 'default' | 'dark' | 'compact';

  // 이벤트
  onRowClicked?: (event: RowClickedEvent<TData>) => void;
  onRowDoubleClicked?: (event: RowClickedEvent<TData>) => void;
  onCellClicked?: (event: CellClickedEvent<TData>) => void;
  onCellValueChanged?: (event: CellValueChangedEvent<TData>) => void;
  onGridReady?: (api: SOGridApi<TData>) => void;

  // 가상화
  virtualizeRows?: boolean;
  overscanCount?: number;
}

// 컬럼 정의 - AG-Grid 스타일
export interface SOColumnDef<TData> {
  field?: keyof TData | string;
  headerName?: string;
  colId?: string;

  // 크기
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  flex?: number;

  // 기능
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  pinned?: 'left' | 'right' | false;
  hide?: boolean;
  lockVisible?: boolean;

  // 렌더링
  cellRenderer?: CellRenderer<TData>;
  headerRenderer?: HeaderRenderer<TData>;
  valueFormatter?: ValueFormatter<TData>;
  valueGetter?: ValueGetter<TData>;

  // 편집
  editable?: boolean;
  cellEditor?: CellEditor<TData>;
  cellEditorParams?: any;

  // 체크박스 선택
  checkboxSelection?: boolean;

  // 스타일
  cellClass?: string | ((params: CellClassParams<TData>) => string);
  cellStyle?: Record<string, any> | ((params: CellClassParams<TData>) => Record<string, any>);
  headerClass?: string;
  headerStyle?: Record<string, any>;

  // 그룹
  children?: SOColumnDef<TData>[];
}

// 렌더러 타입
export type CellRenderer<TData> = (params: CellRendererParams<TData>) => any;
export type HeaderRenderer<TData> = (params: HeaderRendererParams<TData>) => any;
export type ValueFormatter<TData> = (params: ValueFormatterParams<TData>) => string;
export type ValueGetter<TData> = (params: ValueGetterParams<TData>) => any;
export type CellEditor<TData> = string | ((params: CellEditorParams<TData>) => any);

// 파라미터 타입
export interface CellRendererParams<TData> {
  value: any;
  data: TData;
  rowIndex: number;
  colDef: SOColumnDef<TData>;
  api: SOGridApi<TData>;
}

export interface HeaderRendererParams<TData> {
  colDef: SOColumnDef<TData>;
  api: SOGridApi<TData>;
}

export interface ValueFormatterParams<TData> {
  value: any;
  data: TData;
  colDef: SOColumnDef<TData>;
}

export interface ValueGetterParams<TData> {
  data: TData;
  colDef: SOColumnDef<TData>;
}

export interface CellEditorParams<TData> {
  value: any;
  data: TData;
  rowIndex: number;
  colDef: SOColumnDef<TData>;
  onValueChange: (newValue: any) => void;
  stopEditing: () => void;
  api: SOGridApi<TData>;
}

export interface CellClassParams<TData> {
  value: any;
  data: TData;
  rowIndex: number;
  colDef: SOColumnDef<TData>;
}

// 이벤트 타입
export interface RowClickedEvent<TData> {
  data: TData;
  rowIndex: number;
  event: MouseEvent;
}

export interface CellClickedEvent<TData> {
  value: any;
  data: TData;
  rowIndex: number;
  colDef: SOColumnDef<TData>;
  event: MouseEvent;
}

export interface CellValueChangedEvent<TData> {
  value: any;
  oldValue: any;
  data: TData;
  rowIndex: number;
  colDef: SOColumnDef<TData>;
  api: SOGridApi<TData>;
}

// 정렬 모델
export interface SortModel {
  colId: string;
  sort: 'asc' | 'desc';
}



// 필터 모델
export interface FilterModel {
  [colId: string]: FilterCondition;
}

export interface FilterCondition {
  filterType: 'text' | 'number' | 'date' | 'set';
  type?: 'contains' | 'equals' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan';
  filter?: string | number;
  filterTo?: string | number;
  values?: any[];
}

// 서버 사이드 요청 파라미터
export interface ServerSideRequest {
  startRow: number;
  endRow: number;
  sortModel: SortModel[];
  filterModel: FilterModel;
}

// 서버 사이드 응답
export interface ServerSideResponse<TData> {
  rowData: TData[];
  totalRows: number;
}

// Grid API - AG-Grid 스타일
export interface SOGridApi<TData> {
  // 데이터
  setRowData: (rowData: TData[]) => void;
  getRowData: () => TData[];
  getDisplayedRowCount: () => number;

  // 선택
  getSelectedRows: () => TData[];
  selectAll: () => void;
  deselectAll: () => void;
  selectRow: (rowIndex: number) => void;
  deselectRow: (rowIndex: number) => void;

  // 정렬
  setSortModel: (sortModel: SortModel[]) => void;
  getSortModel: () => SortModel[];

  // 필터
  setQuickFilter: (filterText: string) => void;
  resetFilters: () => void;

  // 페이지네이션
  setPage: (page: number) => void;
  getPage: () => number;
  getTotalPages: () => number;
  setPageSize: (size: number) => void;

  // 컬럼
  setColumnVisible: (colId: string, visible: boolean) => void;
  setColumnPinned: (colId: string, pinned: 'left' | 'right' | false) => void;
  getColumnState: () => ColumnState[];
  setColumnState: (state: ColumnState[]) => void;

  // 유틸
  refreshCells: () => void;
  sizeColumnsToFit: () => void;
  exportDataAsCsv: (params?: ExportParams) => void;
}

export interface ColumnState {
  colId: string;
  width?: number;
  hide?: boolean;
  pinned?: 'left' | 'right' | false;
  sort?: 'asc' | 'desc' | null;
  sortIndex?: number;
}

export interface ExportParams {
  fileName?: string;
  columnKeys?: string[];
  onlySelected?: boolean;
}

// 내부 상태 타입
export interface GridState {
  sorting: SortingState;
  rowSelection: RowSelectionState;
  pagination: PaginationState;
  columnPinning: ColumnPinningState;
  columnVisibility: VisibilityState;
  globalFilter: string;
}
