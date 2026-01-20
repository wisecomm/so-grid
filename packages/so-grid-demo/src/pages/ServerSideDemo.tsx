import { fetchServerData, Person } from "@/data";
import React from "react";
import { useCallback, useMemo, useState } from "react";
import { PaginationState, SOColumnDef, SOGrid, SortModel } from "so-grid-react";
import { CustomPagination } from "./CustomPagination";

export default function ServerSideDemo() {
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
                    //                    paginationPageSize={pageSize}
                    //                    paginationPageSizeOptions={[10, 20, 50, 100]}
                    PaginationComponent={CustomPagination}

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
