'use client';

import { useState, type ReactNode } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
  type Table as TableInstance,
  type VisibilityState,
} from '@tanstack/react-table';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  Settings2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmptyState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export type FilterChipOption = {
  label: string;
  value: string;
  count?: number;
};

export type FilterChip = {
  /** ID de la columna a filtrar (debe coincidir con `accessorKey` o `id`). */
  columnId: string;
  label: string;
  options: ReadonlyArray<FilterChipOption>;
};

type Props<TData> = {
  data: ReadonlyArray<TData>;
  columns: ReadonlyArray<ColumnDef<TData>>;
  /** Columna sobre la que aplica el search input. Si no, no se muestra. */
  searchKey?: keyof TData & string;
  searchPlaceholder?: string;
  /** Filter chips definitions (cada uno opera sobre una columna). */
  filters?: ReadonlyArray<FilterChip>;
  /** Habilita la columna de selección con checkbox. */
  enableSelection?: boolean;
  /** Habilita el control de visibilidad de columnas. */
  enableColumnVisibility?: boolean;
  /** Render para acciones bulk cuando hay filas seleccionadas. */
  bulkActions?: (selectedRows: TData[], reset: () => void) => ReactNode;
  /** Estado de carga inicial. */
  isLoading?: boolean;
  /** Tamaño de página local. Solo aplica si no se usa paginación controlada. */
  pageSize?: number;
  emptyState?: {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
  };
  /** Render alternativo para cada fila en mobile (`<md`). */
  cardRender?: (row: TData) => ReactNode;
  className?: string;
  /** Si true, mantiene el orden visual incluso ante reset de selección. */
  getRowId?: (row: TData) => string;
};

export function DataTable<TData>({
  data,
  columns,
  searchKey,
  searchPlaceholder = 'Buscar…',
  filters = [],
  enableSelection = false,
  enableColumnVisibility = true,
  bulkActions,
  isLoading,
  pageSize = 20,
  emptyState,
  cardRender,
  className,
  getRowId,
}: Props<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState('');

  // Inyecta columna de selección si aplica
  const selectionColumn: ColumnDef<TData> | null = enableSelection
    ? {
        id: '__select__',
        header: ({ table }) => (
          <div className="flex items-center px-1">
            <Checkbox
              checked={
                table.getIsAllPageRowsSelected() ||
                (table.getIsSomePageRowsSelected() && 'indeterminate')
              }
              onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
              aria-label="Seleccionar todo"
            />
          </div>
        ),
        cell: ({ row }) => (
          <div className="flex items-center px-1">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(v) => row.toggleSelected(!!v)}
              aria-label="Seleccionar fila"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40,
      }
    : null;

  const finalColumns = selectionColumn ? [selectionColumn, ...columns] : columns;

  const table = useReactTable({
    data: data as TData[],
    columns: finalColumns as ColumnDef<TData>[],
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      rowSelection,
      globalFilter,
      pagination: { pageIndex: 0, pageSize },
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    enableRowSelection: enableSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
    ...(getRowId && { getRowId }),
    globalFilterFn: (row, _columnId, filterValue) => {
      if (!searchKey || !filterValue) return true;
      const value = row.getValue(searchKey);
      if (value == null) return false;
      return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
    },
  });

  const selectedRowCount = table.getFilteredSelectedRowModel().rows.length;
  const selectedRows = table
    .getFilteredSelectedRowModel()
    .rows.map((r) => r.original);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* TOOLBAR */}
      <Toolbar
        table={table}
        searchKey={searchKey}
        searchPlaceholder={searchPlaceholder}
        filters={filters}
        enableColumnVisibility={enableColumnVisibility}
        globalFilter={globalFilter}
        onGlobalFilterChange={setGlobalFilter}
      />

      {/* BULK ACTIONS BAR */}
      {enableSelection && selectedRowCount > 0 && bulkActions && (
        <BulkBar
          count={selectedRowCount}
          onClear={() => table.resetRowSelection()}
        >
          {bulkActions(selectedRows, () => table.resetRowSelection())}
        </BulkBar>
      )}

      {/* TABLE (desktop) / CARDS (mobile) */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : table.getRowModel().rows.length === 0 ? (
        <EmptyState
          icon={emptyState?.icon}
          title={emptyState?.title ?? 'Sin resultados'}
          description={emptyState?.description}
          action={emptyState?.action}
        />
      ) : (
        <>
          {/* MOBILE: cards */}
          {cardRender && (
            <ul className="md:hidden flex flex-col gap-3">
              {table.getRowModel().rows.map((row) => (
                <li key={row.id}>{cardRender(row.original)}</li>
              ))}
            </ul>
          )}

          {/* DESKTOP: table */}
          <div
            className={cn(
              'rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden',
              cardRender && 'hidden md:block',
            )}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr
                      key={headerGroup.id}
                      className="bg-[var(--color-bg-subtle)] border-b border-[var(--color-border)]"
                    >
                      {headerGroup.headers.map((header) => {
                        const canSort = header.column.getCanSort();
                        const sortDir = header.column.getIsSorted();
                        return (
                          <th
                            key={header.id}
                            className="px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.12em] font-semibold text-[var(--color-fg-muted)] text-left whitespace-nowrap"
                            style={
                              header.column.columnDef.size
                                ? { width: header.column.columnDef.size }
                                : undefined
                            }
                          >
                            {header.isPlaceholder ? null : canSort ? (
                              <button
                                type="button"
                                onClick={header.column.getToggleSortingHandler()}
                                className="inline-flex items-center gap-1.5 hover:text-[var(--color-fg-strong)] transition-colors"
                              >
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                                {sortDir === 'asc' ? (
                                  <ArrowUp
                                    className="h-3 w-3"
                                    strokeWidth={1.5}
                                    aria-hidden
                                  />
                                ) : sortDir === 'desc' ? (
                                  <ArrowDown
                                    className="h-3 w-3"
                                    strokeWidth={1.5}
                                    aria-hidden
                                  />
                                ) : (
                                  <ArrowUpDown
                                    className="h-3 w-3 opacity-50"
                                    strokeWidth={1.5}
                                    aria-hidden
                                  />
                                )}
                              </button>
                            ) : (
                              flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      data-state={row.getIsSelected() ? 'selected' : undefined}
                      className={cn(
                        'border-b border-[var(--color-border)] last:border-b-0 transition-colors',
                        row.getIsSelected()
                          ? 'bg-[color-mix(in_oklab,var(--color-accent)_5%,var(--color-surface))]'
                          : 'hover:bg-[var(--color-bg-subtle)]',
                      )}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-3 py-2.5 align-middle text-[var(--color-fg)]"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* PAGINATION */}
      {table.getRowModel().rows.length > 0 && (
        <Pagination table={table} />
      )}
    </div>
  );
}

function Toolbar<TData>({
  table,
  searchKey,
  searchPlaceholder,
  filters,
  enableColumnVisibility,
  globalFilter,
  onGlobalFilterChange,
}: {
  table: TableInstance<TData>;
  searchKey?: string;
  searchPlaceholder?: string;
  filters: ReadonlyArray<FilterChip>;
  enableColumnVisibility?: boolean;
  globalFilter: string;
  onGlobalFilterChange: (v: string) => void;
}) {
  const hasActiveFilters =
    table.getState().columnFilters.length > 0 || globalFilter.length > 0;

  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-3">
      {searchKey && (
        <div className="relative flex-1 lg:max-w-sm">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--color-fg-subtle)] pointer-events-none"
            strokeWidth={1.5}
          />
          <Input
            type="search"
            value={globalFilter ?? ''}
            onChange={(e) => onGlobalFilterChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-9 pl-8 text-sm"
          />
        </div>
      )}

      {filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((filter) => (
            <FilterDropdown key={filter.columnId} table={table} filter={filter} />
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 lg:ml-auto">
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              table.resetColumnFilters();
              onGlobalFilterChange('');
            }}
          >
            <X className="h-3.5 w-3.5" strokeWidth={1.5} />
            Limpiar
          </Button>
        )}
        {enableColumnVisibility && <ColumnVisibility table={table} />}
      </div>
    </div>
  );
}

function FilterDropdown<TData>({
  table,
  filter,
}: {
  table: TableInstance<TData>;
  filter: FilterChip;
}) {
  const column = table.getColumn(filter.columnId);
  if (!column) return null;
  const value = column.getFilterValue() as string[] | undefined;
  const selectedValues = new Set(value ?? []);

  const toggle = (v: string) => {
    const next = new Set(selectedValues);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    column.setFilterValue(next.size === 0 ? undefined : Array.from(next));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-1.5 px-3 h-9 rounded-[var(--radius-button)] border text-sm transition-colors',
            selectedValues.size > 0
              ? 'border-[var(--color-fg-strong)] bg-[var(--color-bg-subtle)] text-[var(--color-fg-strong)]'
              : 'border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-fg-muted)] hover:border-[var(--color-fg-muted)] hover:text-[var(--color-fg-strong)]',
          )}
        >
          {filter.label}
          {selectedValues.size > 0 && (
            <span className="font-mono text-[10px] tnum bg-[var(--color-fg-strong)] text-[var(--color-bg)] rounded-[var(--radius-1)] px-1.5 py-0.5">
              {selectedValues.size}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[180px]">
        <DropdownMenuLabel>{filter.label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {filter.options.map((opt) => (
          <DropdownMenuCheckboxItem
            key={opt.value}
            checked={selectedValues.has(opt.value)}
            onCheckedChange={() => toggle(opt.value)}
            onSelect={(e) => e.preventDefault()}
          >
            <span className="flex-1">{opt.label}</span>
            {opt.count !== undefined && (
              <span className="font-mono text-[10px] tnum text-[var(--color-fg-subtle)] ml-2">
                {opt.count}
              </span>
            )}
          </DropdownMenuCheckboxItem>
        ))}
        {selectedValues.size > 0 && (
          <>
            <DropdownMenuSeparator />
            <button
              type="button"
              onClick={() => column.setFilterValue(undefined)}
              className="w-full text-left px-2 py-1.5 text-sm rounded-[var(--radius-2)] hover:bg-[var(--color-bg-subtle)] text-[var(--color-fg-muted)]"
            >
              Limpiar filtro
            </button>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ColumnVisibility<TData>({ table }: { table: TableInstance<TData> }) {
  const hideableColumns = table
    .getAllColumns()
    .filter((c) => c.getCanHide() && c.id !== '__select__');
  if (hideableColumns.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="sm">
          <Settings2 className="h-3.5 w-3.5" strokeWidth={1.5} />
          <span className="hidden sm:inline">Columnas</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        <DropdownMenuLabel>Mostrar columnas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hideableColumns.map((column) => {
          const headerLabel =
            typeof column.columnDef.header === 'string'
              ? column.columnDef.header
              : column.id;
          return (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={column.getIsVisible()}
              onCheckedChange={(v) => column.toggleVisibility(!!v)}
              onSelect={(e) => e.preventDefault()}
            >
              <Eye className="h-3 w-3" strokeWidth={1.5} />
              {headerLabel}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function BulkBar({
  count,
  onClear,
  children,
}: {
  count: number;
  onClear: () => void;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-fg-strong)] bg-[var(--color-fg-strong)] text-[var(--color-bg)] px-4 py-2.5">
      <span className="font-mono text-[11px] uppercase tracking-[0.12em] font-semibold tnum">
        {count} {count === 1 ? 'SELECCIONADO' : 'SELECCIONADOS'}
      </span>
      <div className="flex items-center gap-2 flex-1 flex-wrap">{children}</div>
      <button
        type="button"
        onClick={onClear}
        className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.12em] opacity-70 hover:opacity-100 transition-opacity"
      >
        <X className="h-3 w-3" strokeWidth={1.5} />
        LIMPIAR
      </button>
    </div>
  );
}

function Pagination<TData>({ table }: { table: TableInstance<TData> }) {
  const pageIndex = table.getState().pagination.pageIndex;
  const pageCount = table.getPageCount();
  const total = table.getFilteredRowModel().rows.length;
  const start = pageIndex * table.getState().pagination.pageSize + 1;
  const end = Math.min(
    (pageIndex + 1) * table.getState().pagination.pageSize,
    total,
  );

  return (
    <nav
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      aria-label="Paginación"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] font-semibold tnum">
        {total === 0
          ? 'SIN RESULTADOS'
          : `${start}–${end} DE ${total}${pageCount > 1 ? ` · PÁGINA ${pageIndex + 1} / ${pageCount}` : ''}`}
      </p>
      {pageCount > 1 && (
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            Anterior
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
            <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Button>
        </div>
      )}
    </nav>
  );
}

function LoadingSkeleton() {
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      <div className="px-3 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
        <Skeleton className="h-3 w-32" />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="px-3 py-3 border-b border-[var(--color-border)] last:border-b-0 flex items-center gap-3"
        >
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/6 ml-auto" />
        </div>
      ))}
    </div>
  );
}
