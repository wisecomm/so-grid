import type { MouseEvent } from 'react';
import { flexRender, type Table, type Row, type Cell } from '@tanstack/react-table';
import type { RowClickedEvent, CellClickedEvent } from 'so-grid-core';

interface SOGridBodyProps<TData> {
  table: Table<TData>;
  rowHeight: number;
  loading?: boolean;
  onRowClicked?: (event: RowClickedEvent<TData>) => void;
  onRowDoubleClicked?: (event: RowClickedEvent<TData>) => void;
  onCellClicked?: (event: CellClickedEvent<TData>) => void;
}

export function SOGridBody<TData>({
  table,
  rowHeight,
  loading,
  onRowClicked,
  onRowDoubleClicked,
  onCellClicked,
}: SOGridBodyProps<TData>) {
  const rows = table.getRowModel().rows;
  const columnCount = table.getAllColumns().length;

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
}

function BodyRow<TData>({
  row,
  rowIndex,
  rowHeight,
  onRowClicked,
  onRowDoubleClicked,
  onCellClicked,
}: BodyRowProps<TData>) {
  const isSelected = row.getIsSelected();

  const handleRowClick = (event: MouseEvent<HTMLTableRowElement>) => {
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
}

function BodyCell<TData>({
  cell,
  row,
  rowIndex,
  onCellClicked,
}: BodyCellProps<TData>) {
  const meta = cell.column.columnDef.meta as any;
  const isPinned = cell.column.getIsPinned();
  const value = cell.getValue();

  const handleClick = (event: MouseEvent<HTMLTableCellElement>) => {
    event.stopPropagation();
    onCellClicked?.({
      value,
      data: row.original,
      rowIndex,
      colDef: meta?.soColDef,
      event: event.nativeEvent,
    });
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
    >
      <div className="so-grid__cell-content" style={cellStyle?.textAlign ? { textAlign: cellStyle.textAlign as any } : undefined}>
        {renderContent()}
      </div>
    </td>
  );
}
