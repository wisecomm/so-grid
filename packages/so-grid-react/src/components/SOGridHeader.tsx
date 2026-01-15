import { flexRender, type Table, type Header } from '@tanstack/react-table';

interface SOGridHeaderProps<TData> {
  table: Table<TData>;
  headerHeight: number;
}

export function SOGridHeader<TData>({
  table,
  headerHeight,
}: SOGridHeaderProps<TData>) {
  return (
    <thead className="so-grid__header">
      {table.getHeaderGroups().map((headerGroup) => (
        <tr
          key={headerGroup.id}
          className="so-grid__header-row"
          style={{ height: headerHeight }}
        >
          {headerGroup.headers.map((header) => (
            <HeaderCell
              key={header.id}
              header={header}
              table={table}
            />
          ))}
        </tr>
      ))}
    </thead>
  );
}

interface HeaderCellProps<TData> {
  header: Header<TData, unknown>;
  table: Table<TData>;
}

function HeaderCell<TData>({ header }: HeaderCellProps<TData>) {
  const meta = header.column.columnDef.meta as any;
  const canSort = header.column.getCanSort();
  const sorted = header.column.getIsSorted();
  const canResize = header.column.getCanResize();
  const isPinned = header.column.getIsPinned();

  const handleClick = () => {
    if (canSort) {
      header.column.toggleSorting();
    }
  };

  const getSortIcon = () => {
    if (sorted === 'asc') return ' ▲';
    if (sorted === 'desc') return ' ▼';
    if (canSort) return ' ⇅'; // 정렬 가능하지만 아직 정렬되지 않은 상태
    return null;
  };

  const headerStyle = meta?.headerStyle || {};

  return (
    <th
      className={`so-grid__header-cell ${isPinned ? `so-grid__header-cell--pinned-${isPinned}` : ''
        } ${meta?.headerClass || ''}`}
      style={{
        ...headerStyle,
        width: header.getSize(),
        minWidth: header.column.columnDef.minSize,
        maxWidth: header.column.columnDef.maxSize,
        position: isPinned ? 'sticky' : undefined,
        left: isPinned === 'left' ? header.getStart('left') : undefined,
        right: isPinned === 'right' ? header.getStart('right') : undefined,
      }}
      colSpan={header.colSpan}
    >
      {header.isPlaceholder ? null : (
        <div
          className={`so-grid__header-cell-content ${canSort ? 'so-grid__header-cell-content--sortable' : ''
            }`}
          style={headerStyle?.textAlign ? { justifyContent: headerStyle.textAlign === 'right' ? 'flex-end' : headerStyle.textAlign === 'center' ? 'center' : 'flex-start' } : undefined}
          onClick={handleClick}
        >
          {meta?.headerRenderer ? (
            meta.headerRenderer({
              colDef: meta.soColDef,
              api: null,
            })
          ) : (
            flexRender(header.column.columnDef.header, header.getContext())
          )}
          {canSort && <span className="so-grid__sort-icon">{getSortIcon()}</span>}
        </div>
      )}
      {canResize && (
        <div
          className={`so-grid__resizer ${header.column.getIsResizing() ? 'so-grid__resizer--resizing' : ''
            }`}
          onMouseDown={header.getResizeHandler()}
          onTouchStart={header.getResizeHandler()}
        />
      )}
    </th>
  );
}
