import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  SOGrid,
  type SOGridRef,
  type SOColumnDef,
  type SOGridApi,
  type SortModel,
  type PaginationState,
} from 'so-grid-react';
import 'so-grid-react/styles.css';

// 샘플 데이터 타입
interface Person {
  id: number;
  name: string;
  email: string;
  age: number;
  department: string;
  salary: number;
  startDate: string;
  status: 'active' | 'inactive' | 'pending';
}

// 전체 데이터 (서버 사이드 시뮬레이션용)
const ALL_DATA: Person[] = generateAllData(1000);

function generateAllData(count: number): Person[] {
  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'];
  const statuses: Person['status'][] = ['active', 'inactive', 'pending'];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Person ${i + 1}`,
    email: `person${i + 1}@example.com`,
    age: 20 + Math.floor(Math.random() * 40),
    department: departments[Math.floor(Math.random() * departments.length)],
    salary: 30000 + Math.floor(Math.random() * 100000),
    startDate: new Date(
      2020 + Math.floor(Math.random() * 4),
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1
    )
      .toISOString()
      .split('T')[0],
    status: statuses[Math.floor(Math.random() * statuses.length)],
  }));
}

// 서버 사이드 API 시뮬레이션
function fetchServerData(params: {
  startRow: number;
  endRow: number;
  sortModel: SortModel[];
}): Promise<{ rowData: Person[]; totalRows: number }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      let data = [...ALL_DATA];

      // 정렬 적용
      if (params.sortModel.length > 0) {
        const { colId, sort } = params.sortModel[0];
        data.sort((a, b) => {
          const aVal = a[colId as keyof Person];
          const bVal = b[colId as keyof Person];
          if (aVal < bVal) return sort === 'asc' ? -1 : 1;
          if (aVal > bVal) return sort === 'asc' ? 1 : -1;
          return 0;
        });
      }

      // 페이지네이션 적용
      const rowData = data.slice(params.startRow, params.endRow);

      resolve({
        rowData,
        totalRows: ALL_DATA.length,
      });
    }, 500); // 500ms 딜레이로 서버 응답 시뮬레이션
  });
}

function AppTwo() {
  const [activeTab, setActiveTab] = useState<'client' | 'server'>('client');

  return (
    <div className="app">
      <header className="app-header">
        <h1>SO-Grid Demo</h1>
        <p>A powerful React grid component based on TanStack Table</p>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'client' ? 'active' : ''}`}
          onClick={() => setActiveTab('client')}
        >
          Client-Side
        </button>
        <button
          className={`tab ${activeTab === 'server' ? 'active' : ''}`}
          onClick={() => setActiveTab('server')}
        >
          Server-Side
        </button>
      </div>

      {activeTab === 'client' ? <ClientSideDemo /> : <ServerSideDemo />}
    </div>
  );
}

// 클라이언트 사이드 데모
function ClientSideDemo() {
  const [theme, setTheme] = useState<'default' | 'dark' | 'compact'>('default');
  const [quickFilter, setQuickFilter] = useState('');
  const [selectedCount, setSelectedCount] = useState(0);
  const gridRef = useRef<SOGridRef<Person>>(null);
  const apiRef = useRef<SOGridApi<Person> | null>(null);

  const rowData = useMemo(() => ALL_DATA.slice(0, 100), []);
  const columnDefs = useColumnDefs();

  const handleGridReady = (api: SOGridApi<Person>) => {
    apiRef.current = api;
  };

  const handleQuickFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuickFilter(value);
    apiRef.current?.setQuickFilter(value);
  };

  return (
    <section className="demo-section">
      <div className="controls">
        <input
          type="text"
          placeholder="Quick filter..."
          value={quickFilter}
          onChange={handleQuickFilterChange}
        />
        <button onClick={() => apiRef.current?.selectAll()}>Select All</button>
        <button onClick={() => apiRef.current?.deselectAll()}>Deselect All</button>
        <button className="primary" onClick={() => apiRef.current?.exportDataAsCsv()}>
          Export CSV
        </button>

        <div className="theme-toggle">
          <label>Theme:</label>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as typeof theme)}
          >
            <option value="default">Default</option>
            <option value="dark">Dark</option>
            <option value="compact">Compact</option>
          </select>
        </div>
      </div>

      <div className="grid-container">
        <SOGrid
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          theme={theme}
          rowSelection="multiple"
          pagination={true}
          paginationPageSize={20}
          paginationPageSizeOptions={[10, 20, 50, 100]}
          sortable={true}
          multiSort={true}
          filterable={true}
          rowHeight={44}
          headerHeight={48}
          onGridReady={handleGridReady}
          onSelectionChanged={(rows) => setSelectedCount(rows.length)}
          defaultColDef={{ resizable: true, sortable: true }}
        />
      </div>

      <div className="info-panel">
        <strong>Selected:</strong> {selectedCount} | <strong>Total:</strong> {rowData.length}
      </div>
    </section>
  );
}

// 서버 사이드 데모
function ServerSideDemo() {
  const [rowData, setRowData] = useState<Person[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sortModel, setSortModel] = useState<SortModel[]>([]);

  const columnDefs = useColumnDefs();

  // 데이터 로드
  const loadData = useCallback(
    async (page: number, size: number, sort: SortModel[]) => {
      setLoading(true);
      try {
        const result = await fetchServerData({
          startRow: page * size,
          endRow: (page + 1) * size,
          sortModel: sort,
        });
        setRowData(result.rowData);
        setTotalRows(result.totalRows);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // 초기 로드
  React.useEffect(() => {
    loadData(0, pageSize, []);
  }, [loadData, pageSize]);

  // 페이지 변경 핸들러
  const handlePaginationChange = useCallback(
    (params: PaginationState) => {
      setCurrentPage(params.pageIndex);
      setPageSize(params.pageSize);
      loadData(params.pageIndex, params.pageSize, sortModel);
    },
    [loadData, sortModel]
  );

  // 정렬 변경 핸들러
  const handleSortChange = useCallback(
    (newSortModel: SortModel[]) => {
      setSortModel(newSortModel);
      setCurrentPage(0); // 정렬 시 첫 페이지로
      loadData(0, pageSize, newSortModel);
    },
    [loadData, pageSize]
  );

  return (
    <section className="demo-section">
      <h2>Server-Side Grid</h2>
      <p className="demo-desc">
        Data fetched from server on demand. Total: <strong>{totalRows.toLocaleString()}</strong> rows.
        Only current page loaded.
      </p>

      <div className="controls">
        <span className="server-status">
          {loading ? '🔄 Loading...' : '✅ Ready'}
        </span>
        <span>
          Page: {currentPage + 1} / {Math.ceil(totalRows / pageSize)}
        </span>
      </div>

      <div className="grid-container">
        <SOGrid
          rowData={rowData}
          columnDefs={columnDefs}
          serverSide={true}
          totalRows={totalRows}
          loading={loading}
          pagination={true}
          paginationPageSize={pageSize}
          paginationPageSizeOptions={[10, 20, 50, 100]}
          sortable={true}
          rowHeight={44}
          headerHeight={48}
          onPaginationChange={handlePaginationChange}
          onSortChange={handleSortChange}
          defaultColDef={{ resizable: true, sortable: true }}
        />
      </div>

      <div className="info-panel">
        <strong>Mode:</strong> Server-Side | <strong>Loaded:</strong> {rowData.length} rows |{' '}
        <strong>Total:</strong> {totalRows.toLocaleString()} rows
      </div>
    </section>
  );
}

// 공통 컬럼 정의
function useColumnDefs(): SOColumnDef<Person>[] {
  return useMemo(
    () => [
      { field: 'id', headerName: 'ID', width: 80, pinned: 'left' },
      { field: 'name', headerName: 'Name', width: 150 },
      { field: 'email', headerName: 'Email', width: 220 },
      { field: 'age', headerName: 'Age', width: 80 },
      { field: 'department', headerName: 'Department', width: 140 },
      {
        field: 'salary',
        headerName: 'Salary',
        width: 120,
        valueFormatter: ({ value }) =>
          new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
          }).format(value),
      },
      { field: 'startDate', headerName: 'Start Date', width: 120 },
      {
        field: 'status',
        headerName: 'Status',
        width: 100,
        cellRenderer: ({ value }) => {
          const colors: Record<string, string> = {
            active: '#4caf50',
            inactive: '#f44336',
            pending: '#ff9800',
          };
          return (
            <span
              style={{
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: '12px',
                backgroundColor: colors[value] || '#999',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 500,
              }}
            >
              {value}
            </span>
          );
        },
      },
    ],
    []
  );
}

export default AppTwo;
