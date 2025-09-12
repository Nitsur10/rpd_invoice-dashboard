import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server/supabase-admin';
import { withLogging } from '@/lib/server/logging';
import { statsQuerySchema } from '@/lib/schemas/stats';

// Get outstanding invoices from Supabase
async function getOutstandingHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q: Record<string, string> = {};
    searchParams.forEach((v, k) => (q[k] = v));
    const parsed = statsQuerySchema.safeParse(q);
    if (!parsed.success) {
      return NextResponse.json(
        { code: 'INVALID_QUERY', message: parsed.error.flatten().formErrors.join('; ') },
        { status: 400 }
      );
    }

    const { dateFrom, dateTo } = parsed.data;
    const defaultFrom = '2025-05-01T00:00:00.000Z';
    const effectiveFrom = dateFrom || defaultFrom;
    
    // Build base query with date filtering
    let baseQuery = supabaseAdmin
      .from('invoices')
      .select('*');
    
    if (effectiveFrom) {
      baseQuery = baseQuery.gte('invoice_date', effectiveFrom);
    }
    if (dateTo) {
      baseQuery = baseQuery.lte('invoice_date', dateTo);
    }
    
    // Get all invoices
    const { data: allInvoices, error } = await baseQuery.select('*');
    
    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { code: 'SERVER_ERROR', message: 'Failed to fetch invoice data' },
        { status: 500 }
      );
    }
    
    const now = new Date();
    
    // Filter for outstanding invoices (not paid, and either pending or overdue)
    const outstandingInvoices = allInvoices.filter(inv => {
      // For now, we'll assume all invoices are outstanding since we don't have payment status
      return true; 
    }).map(inv => {
      const dueDate = new Date(inv.due_date || inv.invoice_date);
      const invoiceDate = new Date(inv.invoice_date || now);
      
      // Calculate days overdue (negative means still pending)
      const timeDiff = now.getTime() - dueDate.getTime();
      const daysOverdue = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      
      return {
        id: inv.id,
        vendor: inv.supplier_name || 'Unknown Vendor',
        amount: inv.total || 0,
        invoiceNumber: inv.invoice_number || `INV-${inv.id}`,
        dueDate: inv.due_date,
        invoiceDate: inv.invoice_date,
        daysOverdue: Math.max(0, daysOverdue), // Only positive values for overdue
        status: daysOverdue > 0 ? 'overdue' : 'pending'
      };
    });
    
    // Sort by amount (highest first) and take top results
    const topOutstanding = outstandingInvoices
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 15); // Get top 15 for flexibility
    
    return NextResponse.json({
      outstanding: topOutstanding,
      summary: {
        totalOutstanding: topOutstanding.reduce((sum, inv) => sum + inv.amount, 0),
        totalCount: topOutstanding.length,
        overdueCount: topOutstanding.filter(inv => inv.status === 'overdue').length,
        largestInvoice: topOutstanding[0]?.amount || 0
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        dateRange: {
          from: dateFrom || null,
          to: dateTo || null
        }
      }
    });
    
  } catch (error) {
    console.error('Failed to get outstanding invoices:', error);
    return NextResponse.json(
      { code: 'SERVER_ERROR', message: 'Failed to get outstanding invoices' },
      { status: 500 }
    );
  }
}

export const GET = withLogging(getOutstandingHandler, 'GET /api/outstanding');
