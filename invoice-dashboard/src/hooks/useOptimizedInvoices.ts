// Optimized invoice data hook with memoization
import { useMemo, useCallback, useState } from 'react';
import { Invoice, PaymentStatus } from '@/lib/types';

interface UseOptimizedInvoicesProps {
  invoices: Invoice[];
  searchTerm?: string;
  statusFilter?: PaymentStatus | 'all';
  vendorFilter?: string | 'all';
}

export function useOptimizedInvoices({
  invoices,
  searchTerm = '',
  statusFilter = 'all',
  vendorFilter = 'all'
}: UseOptimizedInvoicesProps) {
  
  // Memoize filtered results to prevent unnecessary recalculations
  const filteredInvoices = useMemo(() => {
    let filtered = invoices;
    
    // Text search optimization
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(invoice => 
        invoice.vendorName.toLowerCase().includes(search) ||
        invoice.invoiceNumber.toLowerCase().includes(search) ||
        invoice.description.toLowerCase().includes(search)
      );
    }
    
    // Status filter optimization
    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }
    
    // Vendor filter optimization
    if (vendorFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.vendorName === vendorFilter);
    }
    
    return filtered;
  }, [invoices, searchTerm, statusFilter, vendorFilter]);
  
  // Memoize unique vendors for dropdown
  const uniqueVendors = useMemo(() => 
    Array.from(new Set(invoices.map(inv => inv.vendorName))).sort(),
    [invoices]
  );
  
  // Memoize dashboard stats
  const dashboardStats = useMemo(() => {
    const total = filteredInvoices.length;
    const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const pending = filteredInvoices.filter(inv => inv.status === 'pending').length;
    const overdue = filteredInvoices.filter(inv => inv.status === 'overdue').length;
    const paid = filteredInvoices.filter(inv => inv.status === 'paid');
    const paidAmount = paid.reduce((sum, inv) => sum + inv.amount, 0);
    
    return {
      totalInvoices: total,
      totalAmount,
      pendingPayments: pending,
      overduePayments: overdue,
      paidAmount,
      averageAmount: total > 0 ? totalAmount / total : 0
    };
  }, [filteredInvoices]);
  
  // Optimized CSV export function
  const exportToCSV = useCallback(() => {
    const csvData = filteredInvoices.map(invoice => ({
      'Invoice Number': invoice.invoiceNumber,
      'Vendor': invoice.vendorName,
      'Amount': `$${invoice.amount.toFixed(2)} AUD`,
      'Status': invoice.status,
      'Issue Date': invoice.issueDate.toLocaleDateString(),
      'Due Date': invoice.dueDate.toLocaleDateString(),
      'Description': invoice.description
    }));
    
    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rpd-invoices-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }, [filteredInvoices]);
  
  return {
    filteredInvoices,
    uniqueVendors,
    dashboardStats,
    exportToCSV,
    totalCount: filteredInvoices.length
  };
}