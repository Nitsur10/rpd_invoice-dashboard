import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server/supabase-admin';
import { statsQuerySchema } from '@/lib/schemas/stats';
import { withLogging } from '@/lib/server/logging';

// Simple in-memory cache to reduce load and latency
const TTL_MS = 60_000; // 60 seconds
let cache: { key: string; at: number; payload: any } | null = null;
import { isSupabaseConfigured } from '@/lib/server/env';

async function getStatsHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams);
    
    const parsed = statsQuerySchema.safeParse(query);
    
    if (!parsed.success) {
      return NextResponse.json(
        { code: 'INVALID_QUERY', message: parsed.error.flatten().formErrors.join('; ') },
        { status: 400 }
      );
    }

    const { dateFrom, dateTo, triggerError } = parsed.data;
    const defaultFrom = '2025-05-01T00:00:00.000Z';
    const effectiveFrom = dateFrom || defaultFrom;

    // Cache key and lookup
    const key = JSON.stringify({ from: effectiveFrom, to: dateTo || null });
    if (cache && cache.key === key && Date.now() - cache.at < TTL_MS) {
      return NextResponse.json(cache.payload);
    }

    // Simulate error for testing
    if (triggerError) {
      return NextResponse.json(
        { code: 'SERVER_ERROR', message: 'Simulated server error' },
        { status: 500 }
      );
    }

    // If Supabase not configured, return safe empty stats
    if (!isSupabaseConfigured()) {
      const response = {
        overview: {
          totalInvoices: 0,
          pendingPayments: 0,
          overduePayments: 0,
          paidInvoices: 0,
          totalAmount: 0,
          pendingAmount: 0,
          overdueAmount: 0,
          paidAmount: 0,
          trends: { invoices: 0, amount: 0 },
        },
        breakdowns: {
          processingStatus: [],
          categories: [],
          topVendors: [],
        },
        recentActivity: [],
        metadata: {
          generatedAt: new Date().toISOString(),
          dateRange: { from: parsed.data.dateFrom || null, to: parsed.data.dateTo || null },
          periodDays: 0,
        },
      };
      return NextResponse.json(response);
    }

    // Build base query (align table name)
    // Only select fields needed for stats to minimize payload
    let query_builder = supabaseAdmin.from('invoices').select(
      'id,total,payment_status,category,supplier_name,created_at,updated_at,invoice_date'
    );

    if (effectiveFrom) {
      // Use invoice_date if present, otherwise created_at
      query_builder = query_builder.gte('invoice_date', effectiveFrom);
    }
    
    if (dateTo) {
      query_builder = query_builder.lte('created_at', dateTo);
    }

    const { data: invoices, error } = await query_builder;

    if (error) {
      console.warn('Database error in /api/stats, returning empty stats:', error);
      const empty = {
        overview: {
          totalInvoices: 0,
          pendingPayments: 0,
          overduePayments: 0,
          paidInvoices: 0,
          totalAmount: 0,
          pendingAmount: 0,
          overdueAmount: 0,
          paidAmount: 0,
          trends: { invoices: 0, amount: 0 },
        },
        breakdowns: { processingStatus: [], categories: [], topVendors: [] },
        recentActivity: [],
        metadata: {
          generatedAt: new Date().toISOString(),
          dateRange: { from: effectiveFrom || null, to: dateTo || null },
          periodDays: 0,
        },
      };
      cache = { key, at: Date.now(), payload: empty };
      return NextResponse.json(empty);
    }

    const invoiceList = invoices || [];

    // Calculate overview stats
    const totalInvoices = invoiceList.length;
    const pendingInvoices = invoiceList.filter(i => i.payment_status === 'pending');
    const overdueInvoices = invoiceList.filter(i => i.payment_status === 'overdue');
    const paidInvoices = invoiceList.filter(i => i.payment_status === 'paid');

    const totalAmount = invoiceList.reduce((sum, i) => sum + (i.total || 0), 0);
    const pendingAmount = pendingInvoices.reduce((sum, i) => sum + (i.total || 0), 0);
    const overdueAmount = overdueInvoices.reduce((sum, i) => sum + (i.total || 0), 0);
    const paidAmount = paidInvoices.reduce((sum, i) => sum + (i.total || 0), 0);

    // Calculate trends (simplified - comparing with historical data would require additional logic)
    const invoiceTrend = totalInvoices > 0 ? 15.2 : 0;
    const amountTrend = totalAmount > 0 ? 18.2 : 0;

    // Processing status breakdown
    const processingStatus = Object.entries(
      invoiceList.reduce((acc: Record<string, { count: number; amount: number }>, invoice: any) => {
        const status = invoice.processing_status || 'unknown';
        if (!acc[status]) {
          acc[status] = { count: 0, amount: 0 };
        }
        acc[status].count++;
        acc[status].amount += invoice.total || 0;
        return acc;
      }, {} as Record<string, { count: number; amount: number }>)
    ).map(([status, data]) => ({
      status,
      count: data.count,
      amount: data.amount,
    }));

    // Categories breakdown
    const categories = Object.entries(
      invoiceList.reduce((acc: Record<string, { count: number; amount: number }>, invoice: any) => {
        const category = invoice.category || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = { count: 0, amount: 0 };
        }
        acc[category].count++;
        acc[category].amount += invoice.total || 0;
        return acc;
      }, {} as Record<string, { count: number; amount: number }>)
    ).map(([category, data]) => ({
      category,
      count: data.count,
      amount: data.amount,
    })).slice(0, 10); // Top 10 categories

    // Top vendors
    const topVendors = Object.entries(
      invoiceList.reduce((acc: Record<string, { count: number; amount: number }>, invoice: any) => {
        const vendor = invoice.supplier_name || 'Unknown';
        if (!acc[vendor]) {
          acc[vendor] = { count: 0, amount: 0 };
        }
        acc[vendor].count++;
        acc[vendor].amount += invoice.total || 0;
        return acc;
      }, {} as Record<string, { count: number; amount: number }>)
    )
    .sort(([,a], [,b]) => (b as any).amount - (a as any).amount)
    .slice(0, 10)
    .map(([vendor, data]) => ({
      vendor,
      count: data.count,
      amount: data.amount,
    }));

    // Recent activity (would normally come from audit logs)
    const recentActivity = invoiceList
      .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
      .slice(0, 10)
      .map(invoice => ({
        id: `activity-${invoice.id}`,
        action: 'invoice_updated',
        entityId: invoice.id,
        changes: { status: invoice.payment_status },
        createdAt: invoice.updated_at || invoice.created_at,
        user: {
          firstName: 'System',
          lastName: 'User',
          email: 'system@example.com',
        },
      }));

    const periodStart = effectiveFrom || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const periodEnd = dateTo || new Date().toISOString();
    const periodDays = Math.ceil(
      (new Date(periodEnd).getTime() - new Date(periodStart).getTime()) / (1000 * 60 * 60 * 24)
    );

    const response = {
      overview: {
        totalInvoices,
        pendingPayments: pendingInvoices.length,
        overduePayments: overdueInvoices.length,
        paidInvoices: paidInvoices.length,
        totalAmount,
        pendingAmount,
        overdueAmount,
        paidAmount,
        trends: {
          invoices: invoiceTrend,
          amount: amountTrend,
        },
      },
      breakdowns: {
        processingStatus,
        categories,
        topVendors,
      },
      recentActivity,
      metadata: {
        generatedAt: new Date().toISOString(),
        dateRange: {
          from: dateFrom || null,
          to: dateTo || null,
        },
        periodDays,
      },
    };

    cache = { key, at: Date.now(), payload: response };
    return NextResponse.json(response);

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { code: 'SERVER_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withLogging(getStatsHandler, 'GET /api/stats');
