
import type { CellEditorParams } from 'so-grid-core';
import { useState, useRef, useEffect } from 'react';

export function SOTextCellEditor<TData>({
    value,
    onValueChange,
    stopEditing,
}: CellEditorParams<TData>) {
    const [textValue, setTextValue] = useState(value);
    const inputRef = useRef<HTMLInputElement>(null);

    // 초기 포커스
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTextValue(e.target.value);
    };

    const handleBlur = () => {
        onValueChange(textValue);
        stopEditing();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onValueChange(textValue);
            stopEditing();
        } else if (e.key === 'Escape') {
            stopEditing();
        }
    };

    return (
        <input
            ref={inputRef}
            type="text"
            value={textValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="so-grid__cell-editor so-grid__cell-editor--text"
            style={{ width: '100%', height: '100%' }}
        />
    );
}
