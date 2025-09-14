import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server/supabase-admin';
import { isSupabaseConfigured } from '@/lib/server/env';
import { PaymentStatus } from '@/lib/types';

// Get invoices with server-side filtering, sorting, and pagination (Supabase)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = page * limit;
    
    // Sorting parameters (map UI fields to DB columns)
    const sortByRaw = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
    const sortMap: Record<string, string> = {
      createdAt: 'created_at',
      receivedDate: 'created_at',
      dueDate: 'due_date',
      issueDate: 'invoice_date',
      vendorName: 'supplier_name',
      invoiceNumber: 'invoice_number',
      amount: 'total',
      status: 'payment_status',
      category: 'category',
    };
    const sortBy = sortMap[sortByRaw] || 'created_at';
    
    // Filters
    const search = searchParams.get('search') || '';
    const dateFrom = searchParams.get('dateFrom') || '2025-05-01T00:00:00.000Z';
    const dateTo = searchParams.get('dateTo');
    const statusFilters = searchParams.getAll('paymentStatus'); // array

    // If Supabase is not configured, return safe empty payload
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        data: [],
        pagination: {
          total: 0,
          pageCount: 0,
          pageSize: limit,
          pageIndex: page,
        }
      });
    }

    // Resolve table with fallback
    const primaryTable = process.env.SUPABASE_INVOICES_TABLE || 'invoices';
    const fallbackTable = primaryTable === 'invoices' ? 'Invoice' : 'invoices';

    // Build query
    let query = supabaseAdmin
      .from(primaryTable)
      .select('*', { count: 'exact' })
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (search) {
      // Basic OR filter across selected columns
      query = query.or(
        `invoice_number.ilike.%${search}%,supplier_name.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }
    if (statusFilters.length > 0) {
      // Normalize to lower case for database query
      const values = statusFilters.map(s => s.toLowerCase());
      query = query.in('payment_status', values);
    }

    let { data, error, count } = await query;
    // Fallback to alternate table name if table not found
    if (error && (error as any).code === 'PGRST205') {
      let fb = supabaseAdmin
        .from(fallbackTable)
        .select('*', { count: 'exact' })
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + limit - 1);
      if (search) {
        fb = fb.or(`invoice_number.ilike.%${search}%,supplier_name.ilike.%${search}%,description.ilike.%${search}%`)
      }
      if (dateFrom) fb = fb.gte('created_at', dateFrom);
      if (dateTo) fb = fb.lte('created_at', dateTo);
      if (statusFilters.length > 0) fb = fb.in('payment_status', statusFilters.map(s => s.toLowerCase()));

      const fbRes = await fb;
      data = fbRes.data as any[];
      error = fbRes.error as any;
      count = (fbRes as any).count as number;
    }

    if (error) {
      console.warn('Supabase error in /api/invoices, returning empty list:', error);
      return NextResponse.json({
        data: [],
        pagination: {
          total: 0,
          pageCount: 0,
          pageSize: limit,
          pageIndex: page,
        }
      });
    }

    const rows = (data || []).map((row: any) => ({
      id: row.id,
      invoiceNumber: row.invoice_number,
      vendorName: row.supplier_name,
      vendorEmail: row.supplier_email || '',
      amount: row.total || 0,
      amountDue: row.amount_due ?? row.total ?? 0,
      issueDate: row.invoice_date,
      dueDate: row.due_date,
      status: (row.payment_status || 'PENDING').toUpperCase() as PaymentStatus,
      description: row.description || '',
      category: row.category || 'Uncategorized',
      paymentTerms: row.payment_terms || 'Net 30',
      invoiceUrl: row.file_url || row.source_url || '',
      receivedDate: row.created_at,
      paidDate: row.paid_at || null,
    }));

    const total = count || 0;
    const pageCount = Math.ceil(total / limit);

    return NextResponse.json({
      data: rows,
      pagination: {
        total,
        pageCount,
        pageSize: limit,
        pageIndex: page,
      }
    });
  } catch (error) {
    console.error('Failed to load invoices:', error);
    return NextResponse.json(
      { code: 'SERVER_ERROR', message: 'Failed to load invoices' },
      { status: 500 }
    );
  }
}

// Create new invoice (for testing)
export async function POST(request: NextRequest) {
  try {
    const invoice = await request.json();
    
    // Add timestamp and generate ID
    const newInvoice = {
      ...invoice,
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    
    // For now, echo back. Implement Supabase insert if needed.
    return NextResponse.json(newInvoice, { status: 201 });
    
  } catch (error) {
    console.error('Failed to create invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
