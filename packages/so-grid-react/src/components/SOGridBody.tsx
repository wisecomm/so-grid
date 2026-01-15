import { useState, type MouseEvent } from 'react';
import { flexRender, type Table, type Row, type Cell } from '@tanstack/react-table';
import type { RowClickedEvent, CellClickedEvent, CellValueChangedEvent, SOGridApi } from 'so-grid-core';
import { SOSelectCellEditor } from './editors/SOSelectCellEditor';
import { SOTextCellEditor } from './editors/SOTextCellEditor';

interface SOGridBodyProps<TData> {
  table: Table<TData>;
  rowHeight: number;
  loading?: boolean;
  onRowClicked?: (event: RowClickedEvent<TData>) => void;
  onRowDoubleClicked?: (event: RowClickedEvent<TData>) => void;
  onCellClicked?: (event: CellClickedEvent<TData>) => void;
  onCellValueChanged?: (event: CellValueChangedEvent<TData>) => void;
  api: SOGridApi<TData> | null;
}

export function SOGridBody<TData>({
  table,
  rowHeight,
  loading,
  onRowClicked,
  onRowDoubleClicked,
  onCellClicked,
  onCellValueChanged,
  api,
}: SOGridBodyProps<TData>) {
  const rows = table.getRowModel().rows;
  const columnCount = table.getAllColumns().length;

  // 편집 상태 관리
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    colId: string;
  } | null>(null);

  // 편집 시작
  const startEditing = (rowIndex: number, colId: string) => {
    setEditingCell({ rowIndex, colId });
  };

  // 편집 종료
  const stopEditing = () => {
    setEditingCell(null);
  };

  // 로딩 상태
  if (loading) {
    return (
      <tbody className="so-grid__body">
        <tr className="so-grid__row so-grid__row--loading">
          <td colSpan={columnCount} className="so-grid__cell so-grid__cell--loading">
            <div className="so-grid__loading">
              <div className="so-grid__loading-spinner" />
              <span>Loading...</span>
            </div>
          </td>
        </tr>
      </tbody>
    );
  }

  // 데이터 없음
  if (rows.length === 0) {
    return (
      <tbody className="so-grid__body">
        <tr className="so-grid__row so-grid__row--empty">
          <td colSpan={columnCount} className="so-grid__cell so-grid__cell--empty">
            No data to display
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody className="so-grid__body">
      {rows.map((row, rowIndex) => (
        <BodyRow
          key={row.id}
          row={row}
          rowIndex={rowIndex}
          rowHeight={rowHeight}
          onRowClicked={onRowClicked}
          onRowDoubleClicked={onRowDoubleClicked}
          onCellClicked={onCellClicked}
          editingCell={editingCell}
          startEditing={startEditing}
          stopEditing={stopEditing}
          onCellValueChanged={onCellValueChanged}
          api={api}
        />
      ))}
    </tbody>
  );
}

interface BodyRowProps<TData> {
  row: Row<TData>;
  rowIndex: number;
  rowHeight: number;
  onRowClicked?: (event: RowClickedEvent<TData>) => void;
  onRowDoubleClicked?: (event: RowClickedEvent<TData>) => void;
  onCellClicked?: (event: CellClickedEvent<TData>) => void;
  editingCell: { rowIndex: number; colId: string } | null;
  startEditing: (rowIndex: number, colId: string) => void;
  stopEditing: () => void;
  onCellValueChanged?: (event: CellValueChangedEvent<TData>) => void;
  api: SOGridApi<TData> | null;
}

function BodyRow<TData>({
  row,
  rowIndex,
  rowHeight,
  onRowClicked,
  onRowDoubleClicked,
  onCellClicked,
  editingCell,
  startEditing,
  stopEditing,
  onCellValueChanged,
  api,
}: BodyRowProps<TData>) {
  const isSelected = row.getIsSelected();

  const handleRowClick = (event: MouseEvent<HTMLTableRowElement>) => {
    // Row Selection
    if (row.getCanSelect()) {
      row.toggleSelected();
    }

    onRowClicked?.({
      data: row.original,
      rowIndex,
      event: event.nativeEvent,
    });
  };

  const handleRowDoubleClick = (event: MouseEvent<HTMLTableRowElement>) => {
    onRowDoubleClicked?.({
      data: row.original,
      rowIndex,
      event: event.nativeEvent,
    });
  };

  return (
    <tr
      className={`so-grid__row ${isSelected ? 'so-grid__row--selected' : ''} ${rowIndex % 2 === 0 ? 'so-grid__row--even' : 'so-grid__row--odd'
        }`}
      style={{ height: rowHeight }}
      onClick={handleRowClick}
      onDoubleClick={handleRowDoubleClick}
    >
      {row.getVisibleCells().map((cell) => (
        <BodyCell
          key={cell.id}
          cell={cell}
          row={row}
          rowIndex={rowIndex}
          onCellClicked={onCellClicked}
          isEditing={editingCell?.rowIndex === rowIndex && editingCell?.colId === cell.column.id}
          startEditing={startEditing}
          stopEditing={stopEditing}
          onCellValueChanged={onCellValueChanged}
          api={api}
        />
      ))}
    </tr>
  );
}

interface BodyCellProps<TData> {
  cell: Cell<TData, unknown>;
  row: Row<TData>;
  rowIndex: number;
  onCellClicked?: (event: CellClickedEvent<TData>) => void;
  isEditing: boolean;
  startEditing: (rowIndex: number, colId: string) => void;
  stopEditing: () => void;
  onCellValueChanged?: (event: CellValueChangedEvent<TData>) => void;
  api: SOGridApi<TData> | null;
}

function BodyCell<TData>({
  cell,
  row,
  rowIndex,
  onCellClicked,
  isEditing,
  startEditing,
  stopEditing,
  onCellValueChanged,
  api,
}: BodyCellProps<TData>) {
  const meta = cell.column.columnDef.meta as any;
  const isPinned = cell.column.getIsPinned();
  const value = cell.getValue();

  const handleClick = (event: MouseEvent<HTMLTableCellElement>) => {
    onCellClicked?.({
      value,
      data: row.original,
      rowIndex,
      colDef: meta?.soColDef,
      event: event.nativeEvent,
    });
  };

  const handleDoubleClick = () => {
    if (meta?.editable) {
      startEditing(rowIndex, cell.column.id);
    }
  };

  // 값 변경 핸들러
  const handleValueChange = (newValue: any) => {
    // 실제 변경이 있을 때만 이벤트 발생
    if (value !== newValue) {
      onCellValueChanged?.({
        value: newValue,
        oldValue: value,
        data: row.original,
        rowIndex,
        colDef: meta?.soColDef,
        api: api!,
      });
      console.log('Value Changed:', newValue);
    }
    stopEditing();
  };


  // 셀 클래스 계산
  let cellClass = 'so-grid__cell';
  if (isPinned) {
    cellClass += ` so-grid__cell--pinned-${isPinned}`;
  }
  if (meta?.cellClass) {
    if (typeof meta.cellClass === 'function') {
      cellClass += ` ${meta.cellClass({
        value,
        data: row.original,
        rowIndex,
        colDef: meta.soColDef,
      })}`;
    } else {
      cellClass += ` ${meta.cellClass}`;
    }
  }

  // 에디터 렌더링
  if (isEditing && meta?.editable) {
    let EditorComponent = SOTextCellEditor; // 기본 에디터

    if (typeof meta.cellEditor === 'string') {
      if (meta.cellEditor === 'soSelectCellEditor' || meta.cellEditor === 'agSelectCellEditor') {
        EditorComponent = SOSelectCellEditor as any;
      }
    } else if (typeof meta.cellEditor === 'function') {
      EditorComponent = meta.cellEditor;
    }

    return (
      <td
        className={cellClass}
        style={{
          width: cell.column.getSize(),
          minWidth: cell.column.columnDef.minSize,
          maxWidth: cell.column.columnDef.maxSize,
          position: isPinned ? 'sticky' : undefined,
          left: isPinned === 'left' ? cell.column.getStart('left') : undefined,
          right: isPinned === 'right' ? cell.column.getStart('right') : undefined,
          padding: 0, // 에디터 모드에서는 패딩 제거
        }}
      >
        <EditorComponent
          value={value}
          data={row.original}
          rowIndex={rowIndex}
          colDef={meta.soColDef}
          api={api!} // API 객체 전달
          stopEditing={stopEditing}
          onValueChange={handleValueChange}
        />
      </td>
    )
  }

  // 커스텀 렌더러
  const renderContent = () => {
    if (meta?.cellRenderer) {
      return meta.cellRenderer({
        value,
        data: row.original,
        rowIndex,
        colDef: meta.soColDef,
        api: null,
      });
    }

    if (meta?.valueFormatter) {
      return meta.valueFormatter({
        value,
        data: row.original,
        rowIndex,
        colDef: meta.soColDef,
      });
    }

    return flexRender(cell.column.columnDef.cell, cell.getContext());
  };

  // 셀 스타일 계산
  let cellStyle: React.CSSProperties = {};
  if (meta?.cellStyle) {
    if (typeof meta.cellStyle === 'function') {
      cellStyle = meta.cellStyle({
        value,
        data: row.original,
        rowIndex,
        colDef: meta.soColDef,
      });
    } else {
      cellStyle = meta.cellStyle;
    }
  }

  return (
    <td
      className={cellClass}
      style={{
        ...cellStyle,
        width: cell.column.getSize(),
        minWidth: cell.column.columnDef.minSize,
        maxWidth: cell.column.columnDef.maxSize,
        position: isPinned ? 'sticky' : undefined,
        left: isPinned === 'left' ? cell.column.getStart('left') : undefined,
        right: isPinned === 'right' ? cell.column.getStart('right') : undefined,
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <div className="so-grid__cell-content" style={{
        ...(cellStyle?.textAlign ? { textAlign: cellStyle.textAlign as any } : {}),
        ...(meta?.checkboxSelection ? { justifyContent: 'center', display: 'flex' } : {})
      }}>
        {meta?.checkboxSelection ? (
          <input
            type="checkbox"
            className="so-grid__checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => {
              e.stopPropagation();
              row.toggleSelected(e.target.checked);
            }}
            onClick={(e) => e.stopPropagation()}
            style={{ verticalAlign: 'middle', cursor: 'pointer' }}
          />
        ) : (
          renderContent()
        )}
      </div>
    </td>
  );
}
