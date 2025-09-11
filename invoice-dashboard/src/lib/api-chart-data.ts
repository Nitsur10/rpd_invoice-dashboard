import { Invoice } from './types';
import { fetchInvoices, fetchDashboardStats } from './api-client';

/**
 * API-based data service for charts and dashboard components
 * Uses Supabase data with snake_case field names
 */

/**
 * Gets all invoice data from API with date filtering
 */
export async function getAPIInvoiceData(startDate?: Date, endDate?: Date): Promise<Invoice[]> {
  try {
    const response = await fetchInvoices({
      dateFrom: startDate?.toISOString(),
      dateTo: endDate?.toISOString(),
      limit: 1000 // Get all invoices for chart calculations
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching invoice data:', error);
    return [];
  }
}

/**
 * Gets dashboard statistics from API
 */
export async function getAPIDashboardStats(startDate?: Date, endDate?: Date) {
  try {
    const statsData = await fetchDashboardStats(
      startDate?.toISOString(),
      endDate?.toISOString()
    );
    
    return {
      totalInvoices: statsData.overview.totalInvoices,
      totalAmount: statsData.overview.totalAmount,
      pendingPayments: statsData.overview.pendingPayments,
      overduePayments: statsData.overview.overduePayments,
      paidAmount: statsData.overview.paidAmount,
      averageAmount: statsData.overview.totalInvoices > 0 
        ? statsData.overview.totalAmount / statsData.overview.totalInvoices 
        : 0,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      totalInvoices: 0,
      totalAmount: 0,
      pendingPayments: 0,
      overduePayments: 0,
      paidAmount: 0,
      averageAmount: 0,
    };
  }
}

/**
 * Gets invoice data filtered by category using snake_case field names
 */
export async function getAPIInvoicesByCategory(category: string, startDate?: Date, endDate?: Date): Promise<Invoice[]> {
  const invoices = await getAPIInvoiceData(startDate, endDate);
  return invoices.filter(inv => inv.category === category);
}

/**
 * Gets top vendors by amount using snake_case field names
 */
export async function getAPITopVendorsByAmount(limit: number = 10, startDate?: Date, endDate?: Date): Promise<Array<{vendor: string, amount: number, invoiceCount: number}>> {
  const invoices = await getAPIInvoiceData(startDate, endDate);
  const vendorSums = new Map<string, {amount: number, count: number}>();
  
  invoices.forEach(inv => {
    const vendorName = inv.supplier_name || 'Unknown';
    const existing = vendorSums.get(vendorName) || {amount: 0, count: 0};
    vendorSums.set(vendorName, {
      amount: existing.amount + (inv.total || 0),
      count: existing.count + 1
    });
  });
  
  return Array.from(vendorSums.entries())
    .map(([vendor, data]) => ({
      vendor,
      amount: data.amount,
      invoiceCount: data.count
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
}

/**
 * Gets invoice processing time statistics using snake_case field names
 */
export async function getAPIProcessingTimeStats(startDate?: Date, endDate?: Date): Promise<Array<{timeRange: string, count: number}>> {
  const invoices = await getAPIInvoiceData(startDate, endDate);
  const processingTimes = invoices
    .filter(inv => inv.invoice_date && inv.received_date)
    .map(inv => {
      const issueDate = new Date(inv.invoice_date!);
      const receivedDate = new Date(inv.received_date!);
      const diffMs = receivedDate.getTime() - issueDate.getTime();
      return Math.floor(diffMs / (1000 * 60 * 60 * 24)); // Convert to days
    });
  
  const ranges = [
    { label: '0-1 days', min: 0, max: 1 },
    { label: '2-7 days', min: 2, max: 7 },
    { label: '8-14 days', min: 8, max: 14 },
    { label: '15-30 days', min: 15, max: 30 },
    { label: '31+ days', min: 31, max: Infinity }
  ];
  
  return ranges.map(range => ({
    timeRange: range.label,
    count: processingTimes.filter(days => days >= range.min && days <= range.max).length
  }));
}

/**
 * Gets outstanding invoices by amount using snake_case field names
 */
export async function getAPITopOutstandingInvoices(startDate?: Date, endDate?: Date): Promise<Array<{vendor: string, amount: number, daysOverdue: number}>> {
  const invoices = await getAPIInvoiceData(startDate, endDate);
  const today = new Date();
  
  return invoices
    .filter(inv => inv.payment_status === 'overdue' || inv.payment_status === 'pending')
    .map(inv => {
      const daysOverdue = inv.payment_status === 'overdue' && inv.due_date 
        ? Math.floor((today.getTime() - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      
      return {
        vendor: inv.supplier_name || 'Unknown',
        amount: inv.total || 0,
        daysOverdue
      };
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);
}

/**
 * Gets payment velocity gauge data using snake_case field names
 */
export async function getAPIPaymentVelocityData(startDate?: Date, endDate?: Date): Promise<{dso: number, target: number, performance: 'good' | 'fair' | 'poor'}> {
  const invoices = await getAPIInvoiceData(startDate, endDate);
  const paidInvoices = invoices.filter(inv => 
    inv.payment_status === 'paid' && 
    inv.paid_date && 
    inv.invoice_date
  );
  
  if (paidInvoices.length === 0) {
    return { dso: 0, target: 30, performance: 'poor' };
  }
  
  const avgDaysToPay = paidInvoices.reduce((sum, inv) => {
    const paidDate = new Date(inv.paid_date!);
    const issueDate = new Date(inv.invoice_date!);
    const daysToPay = Math.floor((paidDate.getTime() - issueDate.getTime()) / (1000 * 60 * 60 * 24));
    return sum + daysToPay;
  }, 0) / paidInvoices.length;
  
  const dso = Math.round(avgDaysToPay);
  const performance = dso <= 25 ? 'good' : dso <= 40 ? 'fair' : 'poor';
  
  return { dso, target: 30, performance };
}

/**
 * Gets payment status breakdown using snake_case field names
 */
export async function getAPIPaymentStatusBreakdown(startDate?: Date, endDate?: Date): Promise<Array<{name: string, value: number, count: number, amount: number}>> {
  const invoices = await getAPIInvoiceData(startDate, endDate);
  const totalInvoices = invoices.length;

  const statusCounts = invoices.reduce((acc, inv) => {
    const status = inv.payment_status || 'unknown';
    acc[status] = (acc[status] || { count: 0, amount: 0 });
    acc[status].count += 1;
    acc[status].amount += (inv.total || 0);
    return acc;
  }, {} as Record<string, { count: number; amount: number }>);

  return [
    { 
      name: 'Paid', 
      value: totalInvoices > 0 ? Math.round((statusCounts.paid?.count || 0) / totalInvoices * 100) : 0, 
      count: statusCounts.paid?.count || 0, 
      amount: statusCounts.paid?.amount || 0 
    },
    { 
      name: 'Pending', 
      value: totalInvoices > 0 ? Math.round((statusCounts.pending?.count || 0) / totalInvoices * 100) : 0, 
      count: statusCounts.pending?.count || 0, 
      amount: statusCounts.pending?.amount || 0 
    },
    { 
      name: 'Overdue', 
      value: totalInvoices > 0 ? Math.round((statusCounts.overdue?.count || 0) / totalInvoices * 100) : 0, 
      count: statusCounts.overdue?.count || 0, 
      amount: statusCounts.overdue?.amount || 0 
    },
  ].filter(item => item.count > 0);
}