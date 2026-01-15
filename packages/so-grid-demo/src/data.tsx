import { useMemo } from 'react';
import { CommonGrid } from './utils/common-grid';
import {
    type SortModel,
    type SOColumnDef,
} from 'so-grid-react';

// 샘플 데이터 타입
export interface Person {
    id: number;
    name: string;
    email: string;
    age: number;
    department: string;
    salary: number;
    startDate: string;
    status: 'active' | 'inactive' | 'pending';
    style: string;
}

// 전체 데이터 생성
export function generateAllData(count: number): Person[] {
    const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance'];
    const statuses: Person['status'][] = ['active', 'inactive', 'pending'];
    const styles = ['Modern', 'Classic', 'Minimal', 'Bold'];

    return Array.from({ length: count }, (_, i) => ({
        id: i + 1,
        name: `Person ${i + 1}`,
        email: `person${i + 1}@example.com`,
        age: 1020 + Math.floor(Math.random() * 40),
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
        style: styles[Math.floor(Math.random() * styles.length)],
    }));
}

// 전체 데이터 (서버 사이드 시뮬레이션용)
export const ALL_DATA: Person[] = generateAllData(1000);

// 서버 사이드 API 시뮬레이션
export function fetchServerData(params: {
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
                    if (aVal === undefined || bVal === undefined) return 0;
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

const convertStyle = (params: any) => {
    return params.value;
    /*
        return (
            <span style={{ fontWeight: 'bold', color: colors[params.value] }}>
                {params.value} Style
            </span>
        );
    */
};

// 공통 컬럼 정의
export function useColumnDefs(): SOColumnDef<Person>[] {
    return useMemo(
        () => [
            {
                field: 'id',
                headerName: '',
                maxWidth: 70,
                pinned: 'left',
                checkboxSelection: true,
            },
            { field: 'name', headerName: 'Name', width: 150, sortable: true },
            { field: 'email', headerName: 'Email', width: 220 },
            {
                field: 'age',
                headerName: '나이',
                width: 80,
                sortable: true,
                headerStyle: { backgroundColor: '#f1f7ff' },
                cellStyle: { textAlign: 'right', backgroundColor: '#f1f7ff' },
            },
            { field: 'department', headerName: 'Department', width: 140 },
            {
                field: 'salary',
                headerName: 'Salary',
                width: 120,
                cellStyle: { textAlign: 'right' },
                headerStyle: { textAlign: 'right', backgroundColor: '#f1f7ff' },
                valueFormatter: CommonGrid.formatNumber,
            },
            { field: 'startDate', headerName: 'Start Date', width: 120 },
            {
                field: 'style',
                headerName: 'Style',
                width: 120,
                cellRenderer: convertStyle,
                cellStyle: { textAlign: 'center' },
                editable: true,
                cellEditor: 'soSelectCellEditor',
                cellEditorParams: {
                    values: ['Modern', 'Classic', 'Minimal', 'Bold'],
                },
            },
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
