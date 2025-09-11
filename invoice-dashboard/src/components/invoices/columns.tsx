"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowUpDown, MoreHorizontal, Eye, ExternalLink } from "lucide-react"
import { Invoice } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { determinePaymentStatus } from "@/lib/data"

export const invoiceColumns: ColumnDef<Invoice>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllPageRowsSelected()}
        onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
        className="h-4 w-4 rounded border border-slate-300 dark:border-slate-600"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(e.target.checked)}
        className="h-4 w-4 rounded border border-slate-300 dark:border-slate-600"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "invoice_number",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Invoice #
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const invoice = row.original
      return (
        <div className="flex items-center space-x-2">
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {invoice.invoice_number}
          </span>
          {invoice.file_url && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(invoice.file_url, '_blank')}
              className="h-6 w-6 p-0"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "supplier_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Supplier
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const supplier = row.getValue("supplier_name") as string
      return (
        <div className="max-w-[200px]">
          <div className="truncate font-medium text-slate-900 dark:text-slate-100">
            {supplier}
          </div>
          <div className="truncate text-xs text-slate-500 dark:text-slate-400">
            {row.original.supplier_email}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "total",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = row.getValue("total") as number
      return (
        <div className="text-right">
          <div className="font-medium">{formatCurrency(amount)}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "computed_status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const status = determinePaymentStatus(row.original)
      
      const statusConfig = {
        PENDING: { 
          label: "Pending", 
          variant: "secondary" as const,
          className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
        },
        PAID: { 
          label: "Paid", 
          variant: "secondary" as const,
          className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
        },
        OVERDUE: { 
          label: "Overdue", 
          variant: "destructive" as const,
          className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
        },
      }
      
      const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
      
      return (
        <Badge variant={config.variant} className={config.className}>
          {config.label}
        </Badge>
      )
    },
  },
  {
    accessorKey: "source",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Source
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const category = row.getValue("source") as string
      return (
        <Badge variant="outline" className="font-normal">
          {category}
        </Badge>
      )
    },
  },
  {
    accessorKey: "due_date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Due Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const dueDate = row.getValue("due_date") as string
      const isOverdue = dueDate && new Date(dueDate) < new Date()
      
      return (
        <div className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
          {dueDate ? new Date(dueDate).toLocaleDateString('en-AU') : 'N/A'}
        </div>
      )
    },
  },
  {
    accessorKey: "invoice_date", 
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Invoice Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const invoiceDate = row.getValue("invoice_date") as string
      return (
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {invoiceDate ? new Date(invoiceDate).toLocaleDateString('en-AU') : 'N/A'}
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const invoice = row.original
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {invoice.file_url && (
              <DropdownMenuItem
                onClick={() => window.open(invoice.file_url, '_blank')}
                className="cursor-pointer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Invoice
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(invoice.invoiceNumber)}
              className="cursor-pointer"
            >
              Copy Invoice #
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(invoice.supplier_email || '')}
              className="cursor-pointer"
            >
              Copy Supplier Email
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
]