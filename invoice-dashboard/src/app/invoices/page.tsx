"use client"

import * as React from "react"
import {
  ColumnFiltersState,
  SortingState,
  PaginationState,
} from "@tanstack/react-table"

import { DataTable } from "@/components/invoices/data-table"
import { invoiceColumns } from "@/components/invoices/columns"
import { AddInvoiceModal } from "@/components/invoices/add-invoice-modal"
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
  ExternalLink
} from "lucide-react"

import { Invoice, PaymentStatus } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { fetchInvoices, InvoiceFilters } from "@/lib/api-client"

interface DateFilter {
  startDate?: Date
  endDate?: Date
}

export default function InvoicesPage() {
  // Table state
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
  
  // Add invoice modal state
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  
  // Invoice data state and loading
  const [invoiceData, setInvoiceData] = React.useState<Invoice[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Load invoices from API
  React.useEffect(() => {
    const loadInvoices = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetchInvoices({
          dateFrom: dateFilter.startDate?.toISOString(),
          dateTo: dateFilter.endDate?.toISOString(),
          limit: 1000 // Get all invoices for client-side filtering
        })
        setInvoiceData(response.data)
      } catch (err) {
        setError('Failed to load invoices')
        console.error('Error loading invoices:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadInvoices()
  }, [dateFilter])

  // Get all invoices
  const allInvoices = React.useMemo(() => {
    return invoiceData
  }, [invoiceData])

  // Apply global and column filters (date filtering handled by API)
  const filteredInvoices = React.useMemo(() => {
    let filtered = [...allInvoices]
    
    // Apply global search filter using snake_case field names
    if (globalFilter) {
      filtered = filtered.filter(invoice => 
        invoice.invoice_number?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        invoice.supplier_name?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        invoice.description?.toLowerCase().includes(globalFilter.toLowerCase()) ||
        invoice.category?.toLowerCase().includes(globalFilter.toLowerCase())
      )
    }

    // Apply column filters using snake_case field names
    columnFilters.forEach(filter => {
      if (filter.value) {
        filtered = filtered.filter(invoice => {
          const value = (invoice as any)[filter.id]
          if (typeof value === 'string') {
            return value.toLowerCase().includes(String(filter.value).toLowerCase())
          }
          return String(value).includes(String(filter.value))
        })
      }
    })
    
    return filtered
  }, [allInvoices, globalFilter, columnFilters])

  // Apply sorting and pagination
  const processedInvoices = React.useMemo(() => {
    let processed = [...filteredInvoices]
    
    // Apply sorting
    if (sorting.length > 0) {
      const sort = sorting[0]
      processed.sort((a, b) => {
        const aVal = (a as any)[sort.id]
        const bVal = (b as any)[sort.id]
        
        // Handle dates (convert string dates from API)
        if (sort.id === 'invoice_date' || sort.id === 'due_date') {
          const aDate = new Date(aVal)
          const bDate = new Date(bVal)
          return sort.desc ? bDate.getTime() - aDate.getTime() : aDate.getTime() - bDate.getTime()
        }
        
        // Handle numbers
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sort.desc ? bVal - aVal : aVal - bVal
        }
        
        // Handle strings
        const aStr = String(aVal).toLowerCase()
        const bStr = String(bVal).toLowerCase()
        
        if (aStr < bStr) return sort.desc ? 1 : -1
        if (aStr > bStr) return sort.desc ? -1 : 1
        return 0
      })
    }
    
    return processed
  }, [filteredInvoices, sorting])

  // Get paginated results
  const paginatedInvoices = React.useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize
    const end = start + pagination.pageSize
    return processedInvoices.slice(start, end)
  }, [processedInvoices, pagination])

  const pageCount = Math.ceil(processedInvoices.length / pagination.pageSize)

  // Statistics from the current filtered dataset using snake_case field names
  const stats = React.useMemo(() => {
    return {
      total: filteredInvoices.length,
      totalAmount: filteredInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0),
      pending: filteredInvoices.filter(inv => inv.payment_status === 'pending').length,
      paid: filteredInvoices.filter(inv => inv.payment_status === 'paid').length,
      overdue: filteredInvoices.filter(inv => inv.payment_status === 'overdue').length,
    }
  }, [filteredInvoices])

  const handleRowAction = (action: string, invoice: Invoice) => {
    switch (action) {
      case 'view':
        if (invoice.invoice_url) {
          window.open(invoice.invoice_url, '_blank')
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

  const handleAddInvoice = async (newInvoice: Omit<Invoice, 'id'>) => {
    try {
      // In a real implementation, this would call the API to create the invoice
      // For now, we'll just reload the data
      const response = await fetchInvoices({
        dateFrom: dateFilter.startDate?.toISOString(),
        dateTo: dateFilter.endDate?.toISOString(),
        limit: 1000
      })
      setInvoiceData(response.data)
    } catch (err) {
      console.error('Error adding invoice:', err)
    }
  }

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    setDateFilter({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined
    })
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

  return (
    <div className="container mx-auto py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{color: 'oklch(0.25 0.08 240)'}}>
            🏢 RPD Invoice Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Real invoice data from May 1st, 2025 onwards with clickable invoice links
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={resetFilters}
            className="space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Reset Filters</span>
          </Button>
        </div>
      </div>

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
                onChange={(e) => setGlobalFilter(e.target.value)}
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
                {filteredInvoices.length} of {allInvoices.length} invoices
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
                  Total Amount
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

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-950/20">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <strong>Error:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Invoice Links Alert */}
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900/30 dark:bg-blue-950/20">
        <ExternalLink className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          <strong>Invoice Links Available:</strong> Click the "View" action on any invoice to open the actual invoice document.
          All invoices are linked to their source systems (Xero, vendor portals, etc.)
        </AlertDescription>
      </Alert>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Invoice List</span>
            <Badge variant="secondary" className="ml-2">
              {filteredInvoices.length} filtered
            </Badge>
          </CardTitle>
          <CardDescription>
            Real invoice data with direct links to source documents. Use filters above to narrow down results.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={invoiceColumns}
            data={paginatedInvoices}
            pageCount={pageCount}
            pageSize={pagination.pageSize}
            pageIndex={pagination.pageIndex}
            onPaginationChange={setPagination}
            onSortingChange={setSorting}
            onColumnFiltersChange={setColumnFilters}
            sorting={sorting}
            columnFilters={columnFilters}
            isLoading={isLoading}
            onRowAction={handleRowAction}
            onAddInvoice={() => setIsAddModalOpen(true)}
            onDateRangeChange={handleDateRangeChange}
            startDate={dateFilter.startDate?.toISOString().split('T')[0]}
            endDate={dateFilter.endDate?.toISOString().split('T')[0]}
          />
        </CardContent>
      </Card>
      
      {/* Add Invoice Modal */}
      <AddInvoiceModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onAddInvoice={handleAddInvoice}
      />
    </div>
  )
}