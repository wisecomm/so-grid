import { ALL_DATA, Person, useColumnDefs } from "@/data";
import { useRef, useState } from "react";
import { SOGrid, SOGridApi, SOGridRef, CellValueChangedEvent } from "so-grid-react";

export default function ClientSideDemo() {
    const [theme, setTheme] = useState<'default' | 'dark' | 'compact'>('default');
    const [quickFilter, setQuickFilter] = useState('');
    const [selectedCount, setSelectedCount] = useState(0);
    const gridRef = useRef<SOGridRef<Person>>(null);
    const apiRef = useRef<SOGridApi<Person> | null>(null);

    const [rowData, setRowData] = useState(() => ALL_DATA.slice(0, 100));
    const columnDefs = useColumnDefs();

    const handleCellValueChanged = (event: CellValueChangedEvent<Person>) => {
        console.log('Cell Value Changed:', event);
        const newData = rowData.map(item =>
            item.id === event.data.id
                ? { ...item, [event.colDef.field as string]: event.value }
                : item
        );
        setRowData(newData);
    };

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
                    onCellValueChanged={handleCellValueChanged}
                    defaultColDef={{ resizable: true, sortable: true }}
                    pageIndex={1}
                />
            </div>

            <div className="info-panel">
                <strong>Selected:</strong> {selectedCount} | <strong>Total:</strong> {rowData.length}
            </div>
        </section>
    );
}
