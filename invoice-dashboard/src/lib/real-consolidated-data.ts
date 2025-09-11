import { Invoice } from './types';
import consolidatedData from './consolidated-invoice-data.json';

// Real invoice data extracted and consolidated from Excel spreadsheet
const rawInvoiceData = consolidatedData as any[];

/**
 * Transforms consolidated JSON data to Invoice type format
 */
function transformToInvoiceType(rawData: any[]): Invoice[] {
  return rawData.map(invoice => ({
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    vendorName: invoice.vendorName,
    vendorEmail: invoice.vendorEmail,
    amount: invoice.amount,
    amountDue: invoice.amountDue,
    issueDate: invoice.issueDate ? new Date(invoice.issueDate) : new Date(),
    dueDate: invoice.dueDate ? new Date(invoice.dueDate) : new Date(),
    status: invoice.status as 'pending' | 'paid' | 'overdue',
    description: invoice.description,
    category: invoice.category,
    paymentTerms: invoice.paymentTerms,
    invoiceUrl: invoice.invoiceUrl,
    receivedDate: invoice.receivedDate ? new Date(invoice.receivedDate) : new Date(),
    paidDate: invoice.paidDate ? new Date(invoice.paidDate) : undefined
  }));
}

/**
 * Gets all real consolidated invoice data
 */
export function getConsolidatedInvoiceData(startDate?: Date, endDate?: Date): Invoice[] {
  const invoices = transformToInvoiceType(rawInvoiceData);
  if (startDate || endDate) {
    return filterInvoicesByDateRange(invoices, startDate, endDate);
  }
  return invoices;
}

/**
 * Filters invoices by date range based on receivedDate
 */
export function filterInvoicesByDateRange(
  invoices: Invoice[], 
  startDate?: Date, 
  endDate?: Date
): Invoice[] {
  return invoices.filter(invoice => {
    if (startDate && invoice.receivedDate < startDate) return false;
    if (endDate && invoice.receivedDate > endDate) return false;
    return true;
  });
}

/**
 * Gets dashboard statistics from real consolidated data
 */
export function getConsolidatedDashboardStats(startDate?: Date, endDate?: Date) {
  const invoices = getConsolidatedInvoiceData(startDate, endDate);
  
  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const pendingPayments = invoices.filter(inv => inv.status === 'pending').length;
  const overduePayments = invoices.filter(inv => inv.status === 'overdue').length;
  const paidInvoices = invoices.filter(inv => inv.status === 'paid');
  const paidAmount = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  
  return {
    totalInvoices,
    totalAmount,
    pendingPayments,
    overduePayments,
    paidAmount,
    averageAmount: totalAmount / totalInvoices,
    consolidatedFromSources: {
      'Xero only': 98,
      'Frank': 14, 
      'Taxcellent Non Xero': 11
    },
    duplicatesRemoved: 86
  };
}

/**
 * Gets invoice data filtered by category
 */
export function getInvoicesByCategory(category: string): Invoice[] {
  return getConsolidatedInvoiceData().filter(inv => inv.category === category);
}

/**
 * Gets top vendors by amount
 */
export function getTopVendorsByAmount(limit: number = 10): Array<{vendor: string, amount: number, invoiceCount: number}> {
  const invoices = getConsolidatedInvoiceData();
  const vendorSums = new Map<string, {amount: number, count: number}>();
  
  invoices.forEach(inv => {
    const existing = vendorSums.get(inv.vendorName) || {amount: 0, count: 0};
    vendorSums.set(inv.vendorName, {
      amount: existing.amount + inv.amount,
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
 * Gets invoice processing time statistics
 */
export function getProcessingTimeStats(startDate?: Date, endDate?: Date): Array<{timeRange: string, count: number}> {
  const invoices = getConsolidatedInvoiceData(startDate, endDate);
  const processingTimes = invoices
    .filter(inv => inv.issueDate && inv.receivedDate)
    .map(inv => {
      const diffMs = inv.receivedDate.getTime() - inv.issueDate.getTime();
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
 * Gets outstanding invoices by amount (top 10)
 */
export function getTopOutstandingInvoices(startDate?: Date, endDate?: Date): Array<{vendor: string, amount: number, daysOverdue: number}> {
  const invoices = getConsolidatedInvoiceData(startDate, endDate);
  const today = new Date();
  
  return invoices
    .filter(inv => inv.status === 'overdue' || inv.status === 'pending')
    .map(inv => {
      const daysOverdue = inv.status === 'overdue' && inv.dueDate 
        ? Math.floor((today.getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      
      return {
        vendor: inv.vendorName,
        amount: inv.amountDue,
        daysOverdue
      };
    })
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);
}

/**
 * Gets payment velocity gauge data (DSO calculation)
 */
export function getPaymentVelocityData(startDate?: Date, endDate?: Date): {dso: number, target: number, performance: 'good' | 'fair' | 'poor'} {
  const invoices = getConsolidatedInvoiceData(startDate, endDate);
  const paidInvoices = invoices.filter(inv => inv.status === 'paid' && inv.paidDate && inv.issueDate);
  
  if (paidInvoices.length === 0) {
    return { dso: 0, target: 30, performance: 'poor' };
  }
  
  const avgDaysToPay = paidInvoices.reduce((sum, inv) => {
    const daysToPay = Math.floor((inv.paidDate!.getTime() - inv.issueDate.getTime()) / (1000 * 60 * 60 * 24));
    return sum + daysToPay;
  }, 0) / paidInvoices.length;
  
  const dso = Math.round(avgDaysToPay);
  const performance = dso <= 25 ? 'good' : dso <= 40 ? 'fair' : 'poor';
  
  return { dso, target: 30, performance };
}