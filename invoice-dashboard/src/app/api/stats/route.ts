import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Get dashboard statistics from Supabase
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    
    // Build base query
    let baseQuery = supabaseAdmin.from('Invoice');
    
    // Apply date filters if provided
    if (dateFrom) {
      baseQuery = baseQuery.gte('invoice_date', dateFrom);
    }
    if (dateTo) {
      baseQuery = baseQuery.lte('invoice_date', dateTo);
    }
    
    // Get basic counts and totals
    const { data: allInvoices, error } = await baseQuery.select('*');
    
    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch invoice data' },
        { status: 500 }
      );
    }
    
    // Calculate statistics
    const totalInvoices = allInvoices.length;
    const totalAmount = allInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    
    // Since we don't have payment status in the new schema, 
    // we'll determine status based on due dates
    const now = new Date();
    const pendingInvoices = allInvoices.filter(inv => {
      if (!inv.due_date) return true; // No due date = pending
      return new Date(inv.due_date) >= now;
    });
    
    const overdueInvoices = allInvoices.filter(inv => {
      if (!inv.due_date) return false;
      return new Date(inv.due_date) < now;
    });
    
    const pendingPayments = pendingInvoices.length;
    const overduePayments = overdueInvoices.length;
    const paidInvoices = 0; // We don't have paid status in new schema
    
    const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const paidAmount = 0;
    
    // Group by supplier (was vendor)
    const supplierStats = allInvoices.reduce((acc, invoice) => {
      const supplier = invoice.supplier_name || 'Unknown';
      if (!acc[supplier]) {
        acc[supplier] = { count: 0, amount: 0 };
      }
      acc[supplier].count++;
      acc[supplier].amount += invoice.total || 0;
      return acc;
    }, {} as Record<string, { count: number; amount: number }>);
    
    const topSuppliers = Object.entries(supplierStats)
      .map(([supplier, stats]) => ({
        vendor: supplier, // Keep as 'vendor' for API compatibility
        count: stats.count,
        amount: stats.amount
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
    
    // Group by source
    const sourceStats = allInvoices.reduce((acc, invoice) => {
      const source = invoice.source || 'unknown';
      if (!acc[source]) {
        acc[source] = { count: 0, amount: 0 };
      }
      acc[source].count++;
      acc[source].amount += invoice.total || 0;
      return acc;
    }, {} as Record<string, { count: number; amount: number }>);
    
    const processingStatus = Object.entries(sourceStats).map(([source, stats]) => ({
      status: source,
      count: stats.count,
      amount: stats.amount
    }));
    
    // Calculate trends (simplified - comparing with previous period)
    const currentPeriodDays = dateFrom && dateTo ? 
      Math.ceil((new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / (1000 * 60 * 60 * 24)) : 30;
    
    // For trends, we'll just return 0 for now since we don't have historical comparison
    const invoiceTrend = 0;
    const amountTrend = 0;
    
    // Format response to match expected API structure
    const stats = {
      overview: {
        totalInvoices,
        pendingPayments,
        overduePayments,
        paidInvoices,
        totalAmount,
        pendingAmount,
        overdueAmount,
        paidAmount,
        trends: {
          invoices: invoiceTrend,
          amount: amountTrend
        }
      },
      
      breakdowns: {
        processingStatus,
        categories: [
          {
            category: 'invoices',
            count: totalInvoices,
            amount: totalAmount
          }
        ],
        topVendors: topSuppliers
      },
      
      recentActivity: [], // No audit logs in simplified schema
      
      metadata: {
        generatedAt: new Date().toISOString(),
        dateRange: {
          from: dateFrom,
          to: dateTo
        },
        periodDays: currentPeriodDays
      }
    };
    
    return NextResponse.json(stats);
    
  } catch (error) {
    console.error('Failed to get dashboard statistics:', error);
    return NextResponse.json(
      { error: 'Failed to get dashboard statistics' },
      { status: 500 }
    );
  }
}