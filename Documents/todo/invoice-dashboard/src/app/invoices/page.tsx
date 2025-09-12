"use client"

import * as React from "react"
import {
  ColumnFiltersState,
  SortingState,
  PaginationState,
} from "@tanstack/react-table"
import { useQuery } from "@tanstack/react-query"

import { DataTable } from "@/components/invoices/data-table"
import { invoiceColumns } from "@/components/invoices/columns"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  RefreshCw, 
  Download, 
  Clock, 
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Calendar,
  Filter,
  ExternalLink,
  Loader2
} from "lucide-react"

import { fetchInvoices } from "@/lib/api/invoices"
import { Invoice } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

interface DateFilter {
  startDate?: Date
  endDate?: Date
}

// Force this page to be client-only (no SSR/SSG)
export const dynamic = 'force-dynamic'

export default function InvoicesPage() {
  // Table state - server-side pagination
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  // Date filtering state
  const [dateFilter, setDateFilter] = React.useState<DateFilter>({
    startDate: new Date('2025-05-01'), // Default to May 1st, 2025
    endDate: new Date()
  })
  
  // Search state
  const [globalFilter, setGlobalFilter] = React.useState('')

  // Build API params from current state
  const apiParams = React.useMemo(() => ({
    page: pagination.pageIndex,
    limit: pagination.pageSize,
    sortBy: sorting[0]?.id,
    sortOrder: (sorting[0]?.desc ? 'desc' : 'asc') as 'asc' | 'desc' | undefined,
    search: globalFilter || undefined,
    dateFrom: dateFilter.startDate?.toISOString(),
    dateTo: dateFilter.endDate?.toISOString(),
    // Add any column filters
    ...Object.fromEntries(columnFilters.map(f => [f.id, f.value]))
  }), [pagination, sorting, globalFilter, dateFilter, columnFilters])

  // Fetch invoices with React Query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['invoices', apiParams],
    queryFn: () => fetchInvoices(apiParams),
    staleTime: 2 * 60 * 1000, // 2 minutes
    placeholderData: 'keepPreviousData', // Keep previous data while loading new page
    enabled: typeof window !== 'undefined', // Only fetch on client-side
  })

  const invoices = React.useMemo(() => {
    if (!data?.data) return []
    const rows = data.data || []
    // Normalize date fields to Date objects for UI
    return rows.map((inv: any) => ({
      ...inv,
      amount: inv.amount || 0, // Ensure amount is always a number
      status: inv.status || 'pending', // Ensure status is always defined
      issueDate: inv.issueDate ? new Date(inv.issueDate) : undefined,
      dueDate: inv.dueDate ? new Date(inv.dueDate) : undefined,
      receivedDate: inv.receivedDate ? new Date(inv.receivedDate) : undefined,
      paidDate: inv.paidDate ? new Date(inv.paidDate) : undefined,
    }))
  }, [data])
  const totalCount = data?.pagination?.total || 0
  const pageCount = data?.pagination?.pageCount || 0

  // Statistics from the API response
  const stats = React.useMemo(() => {
    if (!invoices.length) {
      return { total: 0, totalAmount: 0, pending: 0, paid: 0, overdue: 0 }
    }

    return {
      total: totalCount,
      totalAmount: invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0),
      pending: invoices.filter(inv => inv.status === 'pending').length,
      paid: invoices.filter(inv => inv.status === 'paid').length,
      overdue: invoices.filter(inv => inv.status === 'overdue').length,
    }
  }, [invoices, totalCount])

  const handleRowAction = (action: string, invoice: Invoice) => {
    switch (action) {
      case 'view':
        if (invoice.invoiceUrl) {
          window.open(invoice.invoiceUrl, '_blank')
        }
        break
      case 'edit':
        console.log('Edit invoice:', invoice.id)
        break
      case 'delete':
        console.log('Delete invoice:', invoice.id)
        break
      default:
        break
    }
  }

  const handleExport = async () => {
    try {
      // Fetch all data for export (without pagination)
      const exportData = await fetchInvoices({ 
        ...apiParams, 
        limit: 1000 // Large limit for export
      })
      
      const csvContent = [
        ['Invoice #', 'Vendor', 'Amount', 'Status', 'Created Date', 'Invoice URL'],
        ...exportData.data.map(inv => [
          inv.invoiceNumber,
          inv.vendor,
          inv.amount.toString(),
          inv.paymentStatus,
          new Date(inv.createdAt).toLocaleDateString(),
          inv.invoiceUrl || ''
        ])
      ]
      
      const csvString = csvContent.map(row => 
        row.map(field => `"${field.toString().replace(/"/g, '""')}"`).join(',')
      ).join('\n')
      
      const blob = new Blob([csvString], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rpd-invoices-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const handleDateFilterChange = (field: 'startDate' | 'endDate', value: string) => {
    if (value) {
      setDateFilter(prev => ({
        ...prev,
        [field]: new Date(value)
      }))
    } else {
      setDateFilter(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
  }

  const resetFilters = () => {
    setDateFilter({
      startDate: new Date('2025-05-01'),
      endDate: new Date()
    })
    setGlobalFilter('')
    setColumnFilters([])
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
  }

  const handlePaginationChange = React.useCallback((updater: any) => {
    setPagination(updater)
  }, [])

  const handleSortingChange = React.useCallback((updater: any) => {
    setSorting(updater)
    // Reset to first page when sorting changes
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
  }, [])

  const handleColumnFiltersChange = React.useCallback((updater: any) => {
    setColumnFilters(updater)
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
  }, [])

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2" style={{color: 'oklch(0.25 0.08 240)'}}>
            🏢 RPD Invoice Management
            {isLoading && <Loader2 className="h-6 w-6 animate-spin" />}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Server-side pagination with real invoice data - {totalCount} total invoices
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
            className="space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="outline"
            onClick={resetFilters}
            className="space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reset Filters</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={!invoices.length || isLoading}
            className="space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-950/20">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <strong>Error loading invoices:</strong> {error instanceof Error ? error.message : 'Unknown error'}
          </AlertDescription>
        </Alert>
      )}

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search invoices..."
                value={globalFilter}
                onChange={(e) => {
                  setGlobalFilter(e.target.value)
                  setPagination(prev => ({ ...prev, pageIndex: 0 }))
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="startDate">From Date</Label>
              <Input
                id="startDate"
                type="date"
                value={dateFilter.startDate?.toISOString().split('T')[0] || ''}
                onChange={(e) => handleDateFilterChange('startDate', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">To Date</Label>
              <Input
                id="endDate"
                type="date"
                value={dateFilter.endDate?.toISOString().split('T')[0] || ''}
                onChange={(e) => handleDateFilterChange('endDate', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Showing Results</Label>
              <div className="text-sm text-slate-600 dark:text-slate-400 pt-2">
                {invoices.length} of {totalCount} invoices
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total Invoices
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {stats.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" style={{color: 'oklch(0.65 0.12 80)'}} />
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Current Page Total
                </p>
                <p className="text-2xl font-bold" style={{color: 'oklch(0.65 0.12 80)'}}>
                  {formatCurrency(stats.totalAmount)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Pending
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Paid
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.paid}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Overdue
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.overdue}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Server Pagination Alert */}
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-950/20">
        <ExternalLink className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          <strong>Server-Side Pagination:</strong> This table now uses server-side pagination, sorting, and filtering for optimal performance with large datasets.
        </AlertDescription>
      </Alert>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Invoice List</span>
            <Badge variant="secondary" className="ml-2">
              Page {pagination.pageIndex + 1} of {pageCount}
            </Badge>
          </CardTitle>
          <CardDescription>
            Server-side paginated invoice data. Use filters above to narrow down results.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={invoiceColumns}
            data={invoices}
            pageCount={pageCount}
            pageSize={pagination.pageSize}
            pageIndex={pagination.pageIndex}
            onPaginationChange={handlePaginationChange}
            onSortingChange={handleSortingChange}
            onColumnFiltersChange={handleColumnFiltersChange}
            sorting={sorting}
            columnFilters={columnFilters}
            isLoading={isLoading}
            onRowAction={handleRowAction}
            manualPagination={true}
            manualSorting={true}
            manualFiltering={true}
          />
        </CardContent>
      </Card>
    </div>
  )
}
