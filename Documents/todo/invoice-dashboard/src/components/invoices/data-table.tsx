"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTablePagination } from "@/components/invoices/data-table-pagination"
import { DataTableToolbar } from "@/components/invoices/data-table-toolbar"
import { DataTableViewOptions } from "@/components/invoices/data-table-view-options"

import { ChevronDown } from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pageCount: number
  pageSize: number
  pageIndex: number
  onPaginationChange: (pagination: { pageIndex: number; pageSize: number }) => void
  onSortingChange: (sorting: SortingState) => void
  onColumnFiltersChange: (filters: ColumnFiltersState) => void
  sorting: SortingState
  columnFilters: ColumnFiltersState
  isLoading?: boolean
  onRowAction?: (action: string, invoice: Invoice) => void
  manualPagination?: boolean
  manualSorting?: boolean
  manualFiltering?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  pageSize,
  pageIndex,
  onPaginationChange,
  onSortingChange,
  onColumnFiltersChange,
  sorting,
  columnFilters,
  isLoading = false,
  onRowAction,
  manualPagination = false,
  manualSorting = false,
  manualFiltering = false,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange,
    onColumnFiltersChange,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination,
    manualSorting,
    manualFiltering,
  })

  // Row virtualization setup
  const tableContainerRef = React.useRef<HTMLDivElement>(null)
  
  const rowVirtualizer = useVirtualizer({
    count: table.getRowModel().rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 48, // Estimated row height in pixels
    overscan: 5,
  })

  return (
    <div className="space-y-4">
      <DataTableToolbar table={table} />
      <div className="rounded-md border bg-white dark:bg-slate-900">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="h-12">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
        </Table>
        
        {/* Virtualized table body container */}
        <div 
          ref={tableContainerRef}
          className="relative overflow-auto"
          style={{ height: '600px' }} // Fixed height for virtualization
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {isLoading ? (
              // Loading skeletons
              <div className="space-y-1 p-4">
                {Array.from({ length: pageSize }).map((_, index) => (
                  <div key={index} className="flex space-x-4 py-2">
                    {columns.map((_, cellIndex) => (
                      <div key={cellIndex} className="flex-1">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : table.getRowModel().rows?.length ? (
              // Virtualized rows
              rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const row = table.getRowModel().rows[virtualRow.index]
                return (
                  <div
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="absolute inset-x-0 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    style={{
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <div className="flex items-center h-full px-4">
                      {row.getVisibleCells().map((cell) => (
                        <div key={cell.id} className="flex-1 py-3">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="flex items-center justify-center h-24 text-center text-slate-500 dark:text-slate-400">
                No invoices found.
              </div>
            )}
          </div>
        </div>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
}

