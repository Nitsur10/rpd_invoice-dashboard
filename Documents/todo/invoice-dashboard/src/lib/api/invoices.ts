// Client-side API for invoice operations
import { trackAPIPerformance } from '@/lib/observability'

export interface Invoice {
  id: string
  emailId?: string
  subject?: string
  invoiceNumber: string
  amount: number
  vendor: string
  sourceTab?: string
  paymentStatus: 'PENDING' | 'PAID' | 'OVERDUE'
  createdAt: string
  updatedAt?: string
  dueDate?: string
  description?: string
  category?: string
  invoiceUrl?: string
}

export interface InvoicesParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  status?: string
  vendor?: string
  dateFrom?: string
  dateTo?: string
}

export interface InvoicesResponse {
  data: Invoice[]
  pagination: {
    total: number
    pageCount: number
    pageSize: number
    pageIndex: number
  }
}

const API_BASE = process.env.NODE_ENV === 'development' ? '' : '/api'

export async function fetchInvoices(params: InvoicesParams = {}): Promise<InvoicesResponse> {
  const startTime = Date.now()
  
  try {
    const url = new URL(`${API_BASE}/api/invoices`, 
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001')
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value))
      }
    })

    const response = await fetch(url.toString())
    
    if (!response.ok) {
      throw new Error(`Invoices API failed: ${response.status} ${response.statusText}`)
    }

    const data: InvoicesResponse = await response.json()
    const duration = Date.now() - startTime
    
    // Log API performance for budget tracking (client-side)
    trackAPIPerformance('/api/invoices', duration)
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Invoices API] Success: ${duration}ms`, { params, total: data.pagination.total })
    }

    return data
  } catch (error) {
    const duration = Date.now() - startTime
    
    // Track failed requests too
    trackAPIPerformance('/api/invoices', duration)
    
    if (process.env.NODE_ENV === 'development') {
      console.error(`[Invoices API] Error: ${duration}ms`, { params, error })
    }
    
    throw error
  }
}

export async function fetchInvoiceById(id: string): Promise<Invoice> {
  const startTime = Date.now()
  
  try {
    const url = new URL(`${API_BASE}/api/invoices/${id}`, 
      typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001')

    const response = await fetch(url.toString())
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Invoice not found')
      }
      throw new Error(`Invoice API failed: ${response.status} ${response.statusText}`)
    }

    const data: Invoice = await response.json()
    const duration = Date.now() - startTime
    
    trackAPIPerformance('/api/invoices/[id]', duration)
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Invoice API] Success: ${duration}ms`, { id })
    }

    return data
  } catch (error) {
    const duration = Date.now() - startTime
    
    trackAPIPerformance('/api/invoices/[id]', duration)
    
    if (process.env.NODE_ENV === 'development') {
      console.error(`[Invoice API] Error: ${duration}ms`, { id, error })
    }
    
    throw error
  }
}