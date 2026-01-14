import { ALL_DATA, Person, useColumnDefs } from "@/data";
import { useToast } from "@/hooks/use-toast";
import { useMemo, useRef, useState } from "react";
import { SOGrid, SOGridApi, SOGridRef } from "so-grid-react";
import { DataTableToolbar } from "./data-table-toolbar";
import { CustomPagination } from "@/components/CustomPagination";


export default function OrderDemo() {
    const [theme] = useState<'default' | 'dark' | 'compact'>('default');

    const [selectedCount, setSelectedCount] = useState(0);
    const gridRef = useRef<SOGridRef<Person>>(null);
    const apiRef = useRef<SOGridApi<Person> | null>(null);

    const rowData = useMemo(() => ALL_DATA.slice(0, 100), []);
    const columnDefs = useColumnDefs();

    const handleGridReady = (api: SOGridApi<Person>) => {
        apiRef.current = api;
    };

    const [isLoading, setIsLoading] = useState(false);
    const [searchParams, setSearchParams] = useState({ startDate: '', endDate: '' });
    const { toast } = useToast();

    const handleAdd = () => {
        toast({ title: "Add Clicked", description: "Not implemented yet" });
    };

    const handleEdit = () => {
        const selected = apiRef.current?.getSelectedRows();
        if (!selected || selected.length === 0) {
            toast({ title: "No Selection", description: "Please select a row to edit", variant: "destructive" });
            return;
        }
        toast({ title: "Edit Clicked", description: `Editing ${selected.length} items` });
    };

    const handleDeleteClick = () => {
        const selected = apiRef.current?.getSelectedRows();
        if (!selected || selected.length === 0) {
            toast({ title: "No Selection", description: "Please select a row to delete", variant: "destructive" });
            return;
        }
        toast({ title: "Delete Clicked", description: `Deleting ${selected.length} items` });
    };

    const onSearch = (params: { custNm: string; startDate: string; endDate: string }) => {
        setIsLoading(true);
        console.log("Searching with:", params);
        setSearchParams({ startDate: params.startDate, endDate: params.endDate }); // Update search params to reflect in toolbar if needed

        // Simulate search delay
        setTimeout(() => {
            setIsLoading(false);
            if (apiRef.current) {
                // simple client-side filter simulation if needed, or just relying on quickFilter for now
                // For this demo, let's just toast
                toast({ title: "Search", description: `Search params: ${JSON.stringify(params)}` });
            }
        }, 500);
    };



    return (
        <section className="demo-section">
            <div className="controls">
                <DataTableToolbar
                    onAdd={handleAdd}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    onSearch={onSearch}
                    isLoading={isLoading}
                    initialStartDate={searchParams.startDate}
                    initialEndDate={searchParams.endDate}
                />
            </div>

            <div className="grid-container">
                <SOGrid
                    ref={gridRef}
                    rowData={rowData}
                    columnDefs={columnDefs}
                    theme={theme}
                    rowSelection="multiple"
                    pagination={true}
                    paginationPageSize={10}
                    paginationPageSizeOptions={[10, 20, 50, 100]}
                    PaginationComponent={CustomPagination}
                    suppressScrollOnNewData={true}
                    sortable={false}
                    multiSort={true}
                    filterable={true}
                    rowHeight={44}
                    headerHeight={48}
                    onGridReady={handleGridReady}
                    onSelectionChanged={(rows) => setSelectedCount(rows.length)}
                    defaultColDef={{ resizable: true }}
                />
            </div>

            <div className="info-panel">
                <strong>Selected:</strong> {selectedCount} | <strong>Total:</strong> {rowData.length}
            </div>
        </section>
    );
}
