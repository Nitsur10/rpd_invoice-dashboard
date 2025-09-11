// API client functions for database operations
import { Invoice, DashboardStats, PaymentStatus } from './types';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : '/api';

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    pageCount: number;
    pageSize: number;
    pageIndex: number;
  };
}

export interface InvoiceFilters {
  invoiceNumber?: string;
  supplier?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Invoice API functions
export async function fetchInvoices(filters?: InvoiceFilters): Promise<PaginatedResponse<Invoice>> {
  const params = new URLSearchParams();
  
  if (filters) {
    if (filters.invoiceNumber) params.set('invoiceNumber', filters.invoiceNumber);
    if (filters.supplier) params.set('supplier', filters.supplier);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    if (filters.minAmount !== undefined) params.set('minAmount', filters.minAmount.toString());
    if (filters.maxAmount !== undefined) params.set('maxAmount', filters.maxAmount.toString());
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
    if (filters.page !== undefined) params.set('page', filters.page.toString());
    if (filters.limit !== undefined) params.set('limit', filters.limit.toString());
  }
  
  const url = `${API_BASE_URL}/invoices${params.toString() ? '?' + params.toString() : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch invoices: ${response.statusText}`);
  }
  
  return response.json();
}

export async function fetchInvoiceById(id: string): Promise<Invoice> {
  const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch invoice: ${response.statusText}`);
  }
  
  return response.json();
}

export async function createInvoice(invoiceData: Partial<Invoice>): Promise<Invoice> {
  const response = await fetch(`${API_BASE_URL}/invoices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(invoiceData),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to create invoice: ${response.statusText}`);
  }
  
  return response.json();
}

export async function updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
  const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update invoice: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.invoice;
}

export async function deleteInvoice(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete invoice: ${response.statusText}`);
  }
}

// Statistics API functions
export interface DashboardStatsAPI {
  overview: {
    totalInvoices: number;
    pendingPayments: number;
    overduePayments: number;
    paidInvoices: number;
    totalAmount: number;
    pendingAmount: number;
    overdueAmount: number;
    paidAmount: number;
    trends: {
      invoices: number;
      amount: number;
    };
  };
  breakdowns: {
    processingStatus: Array<{
      status: string;
      count: number;
      amount: number;
    }>;
    categories: Array<{
      category: string;
      count: number;
      amount: number;
    }>;
    topVendors: Array<{
      vendor: string;
      count: number;
      amount: number;
    }>;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    entityId: string;
    changes: any;
    createdAt: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    } | null;
  }>;
  metadata: {
    generatedAt: string;
    dateRange: {
      from: string | null;
      to: string | null;
    };
    periodDays: number;
  };
}

export async function fetchDashboardStats(dateFrom?: string, dateTo?: string): Promise<DashboardStatsAPI> {
  const params = new URLSearchParams();
  if (dateFrom) params.set('dateFrom', dateFrom);
  if (dateTo) params.set('dateTo', dateTo);
  
  const url = `${API_BASE_URL}/stats${params.toString() ? '?' + params.toString() : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard stats: ${response.statusText}`);
  }
  
  return response.json();
}

// Audit API functions
export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  changes: any;
  createdAt: string;
  userId: string | null;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export interface AuditFilters {
  entityType?: string;
  entityId?: string;
  userId?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
  type?: 'recent' | 'entity' | 'user';
  page?: number;
  limit?: number;
}

export async function fetchAuditLogs(filters?: AuditFilters): Promise<PaginatedResponse<AuditLog>> {
  const params = new URLSearchParams();
  
  if (filters) {
    if (filters.entityType) params.set('entityType', filters.entityType);
    if (filters.entityId) params.set('entityId', filters.entityId);
    if (filters.userId) params.set('userId', filters.userId);
    if (filters.action) params.set('action', filters.action);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    if (filters.type) params.set('type', filters.type);
    if (filters.page !== undefined) params.set('page', filters.page.toString());
    if (filters.limit !== undefined) params.set('limit', filters.limit.toString());
  }
  
  const url = `${API_BASE_URL}/audit${params.toString() ? '?' + params.toString() : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch audit logs: ${response.statusText}`);
  }
  
  return response.json();
}

// Helper functions to convert API stats to legacy format
export function convertAPIStatsToDashboardStats(apiStats: DashboardStatsAPI): DashboardStats {
  return {
    totalInvoices: apiStats.overview.totalInvoices,
    totalAmount: apiStats.overview.totalAmount,
    pendingPayments: apiStats.overview.pendingPayments,
    overduePayments: apiStats.overview.overduePayments,
    paidAmount: apiStats.overview.paidAmount,
    averageAmount: apiStats.overview.totalInvoices > 0 
      ? apiStats.overview.totalAmount / apiStats.overview.totalInvoices 
      : 0,
  };
}

// Error handling helper
export class APIError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleAPIError(error: any): APIError {
  if (error instanceof APIError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new APIError(error.message);
  }
  
  return new APIError('An unexpected error occurred');
}