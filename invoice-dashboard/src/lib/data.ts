import { Invoice, DashboardStats, PaymentStatus } from './types';
import { format } from 'date-fns';

const SYDNEY_TZ = 'Australia/Sydney';

export function formatDateForSydney(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Sydney',
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    timeZoneName: 'short'
  }).format(dateObj);
}

export function formatDateForDisplay(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MM/dd/yyyy');
}

export function formatDateForInput(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD'
  }).format(amount);
}

export function getStatusBadgeVariant(status: PaymentStatus): 'default' | 'secondary' | 'destructive' {
  switch (status) {
    case 'PAID':
      return 'default';
    case 'OVERDUE':
      return 'destructive';
    default:
      return 'secondary';
  }
}

export function isDueSoon(dueDate?: string): boolean {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  const now = new Date();
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays <= 7 && diffDays >= 0;
}

export function isOverdue(dueDate?: string): boolean {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  const now = new Date();
  return due < now;
}

export function determinePaymentStatus(invoice: Invoice): PaymentStatus {
  // Auto-determine based on due date
  if (invoice.due_date && isOverdue(invoice.due_date.toString())) {
    return 'OVERDUE';
  }
  
  return 'PENDING';
}

export function calculateDashboardStats(invoices: Invoice[]): DashboardStats {
  const stats: DashboardStats = {
    totalInvoices: invoices.length,
    totalAmount: 0,
    pendingPayments: 0,
    overduePayments: 0,
    paidAmount: 0,
    averageAmount: 0,
  };

  invoices.forEach(invoice => {
    stats.totalAmount += invoice.total;
    
    const status = determinePaymentStatus(invoice);
    
    switch (status) {
      case 'PAID':
        stats.paidAmount += invoice.total;
        break;
      case 'OVERDUE':
        stats.overduePayments += 1;
        break;
      case 'PENDING':
        stats.pendingPayments += 1;
        break;
    }
  });

  stats.averageAmount = stats.totalInvoices > 0 ? stats.totalAmount / stats.totalInvoices : 0;
  
  return stats;
}

export function calculateTotalRevenue(invoices: Invoice[]): number {
  return invoices.reduce((sum, invoice) => sum + invoice.total, 0);
}

export function calculateOverdueInvoices(invoices: Invoice[]): number {
  return invoices.filter(invoice => determinePaymentStatus(invoice) === 'OVERDUE').length;
}

// Legacy function - now uses API
export async function getInvoiceData(): Promise<Invoice[]> {
  try {
    const { fetchInvoices } = await import('./api-client');
    const response = await fetchInvoices({ limit: 1000 }); // Get all invoices
    return response.data;
  } catch (error) {
    console.error('Failed to fetch invoices from API, falling back to static data:', error);
    // Fallback to static data if API fails
    const { getRealInvoiceData } = require('./real-invoice-data');
    return getRealInvoiceData();
  }
}

// New async function for server-side usage
export async function fetchInvoiceDataFromAPI(filters?: {
  paymentStatus?: PaymentStatus[];
  vendor?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}): Promise<Invoice[]> {
  const { fetchInvoices } = await import('./api-client');
  const response = await fetchInvoices(filters);
  return response.data;
}

export function groupInvoicesByStatus(invoices: Invoice[]) {
  const groups = {
    PENDING: [] as Invoice[],
    PAID: [] as Invoice[],
    OVERDUE: [] as Invoice[],
  };

  invoices.forEach(invoice => {
    const status = determinePaymentStatus(invoice);
    groups[status].push(invoice);
  });

  return groups;
}