
import type { CellEditorParams } from 'so-grid-core';
import { useState, useRef, useEffect } from 'react';

export function SOSelectCellEditor<TData>({
    value,
    onValueChange,
    stopEditing,
    colDef,
}: CellEditorParams<TData>) {
    const [selectedValue, setSelectedValue] = useState(value);
    const selectRef = useRef<HTMLSelectElement>(null);
    const params = colDef.cellEditorParams || {};
    const values = params.values || [];

    // 초기 포커스
    useEffect(() => {
        selectRef.current?.focus();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedValue(e.target.value);
    };

    const handleBlur = () => {
        onValueChange(selectedValue);
        stopEditing();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onValueChange(selectedValue);
            stopEditing();
        } else if (e.key === 'Escape') {
            stopEditing();
        }
    };

    return (
        <select
            ref={selectRef}
            value={selectedValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="so-grid__cell-editor so-grid__cell-editor--select"
            style={{ width: '100%', height: '100%' }}
        >
            {values.map((option: string) => (
                <option key={option} value={option}>
                    {option}
                </option>
            ))}
        </select>
    );
}
