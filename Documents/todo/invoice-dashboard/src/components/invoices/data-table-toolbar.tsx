"use client"

import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "@/components/invoices/data-table-view-options"
import { DataTableFacetedFilter } from "@/components/invoices/data-table-faceted-filter"
import { Search, FilterX, Download, Plus, RefreshCw } from "lucide-react"
import { PaymentStatus } from "@/lib/types"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
}

// Filter options for invoice-specific fields
const paymentStatuses = [
  {
    value: "pending",
    label: "Pending",
    icon: "🟡",
  },
  {
    value: "paid", 
    label: "Paid",
    icon: "🟢",
  },
  {
    value: "overdue",
    label: "Overdue", 
    icon: "🔴",
  },
]

const categories = [
  {
    value: "Construction",
    label: "Construction",
    icon: "🏗️",
  },
  {
    value: "Utilities",
    label: "Utilities",
    icon: "⚡", 
  },
  {
    value: "Materials",
    label: "Materials",
    icon: "📦",
  },
  {
    value: "Professional Services",
    label: "Professional Services",
    icon: "💼",
  },
]

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-center md:space-x-4">
        {/* Search Input */}
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
          <Input
            placeholder="Search invoices..."
            value={(table.getColumn("vendorName")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("vendorName")?.setFilterValue(event.target.value)
            }
            className="pl-8"
          />
        </div>

        {/* Faceted Filters */}
        <div className="flex flex-wrap gap-2">
          {table.getColumn("status") && (
            <DataTableFacetedFilter
              column={table.getColumn("status")}
              title="Status"
              options={paymentStatuses}
            />
          )}
          {table.getColumn("category") && (
            <DataTableFacetedFilter
              column={table.getColumn("category")}
              title="Category"
              options={categories}
            />
          )}
        </div>

        {/* Clear Filters */}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Clear filters
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="ml-auto h-8"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="h-8"
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        
        <Button
          size="sm"
          className="h-8"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Invoice
        </Button>
        
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}