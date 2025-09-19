import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server/supabase-admin';
import { isSupabaseConfigured } from '@/lib/server/env';
import type { InvoiceFiltersState } from '@/types/invoice-filters';
import { mockInvoiceData } from '@/lib/sample-data';

// Get invoices with server-side filtering, sorting, and pagination (Supabase)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const now = new Date();
    const nowIso = now.toISOString();
    
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
      status: 'due_date',
      category: 'category',
    };
    const sortBy = sortMap[sortByRaw] || 'created_at';
    
    const searchParam = searchParams.get('search') || '';
    const statusFilters = searchParams.getAll('status');
    const categoryFilters = searchParams.getAll('category');
    const vendorFilters = searchParams.getAll('vendor');
    const savedViewId = searchParams.get('savedViewId');
    const dateFromParam = searchParams.get('dateFrom');
    const dateToParam = searchParams.get('dateTo');
    const amountMinParam = parseNullableNumber(searchParams.get('amountMin'));
    const amountMaxParam = parseNullableNumber(searchParams.get('amountMax'));

    // If Supabase is not configured, return safe empty payload
    const useSupabase = isSupabaseConfigured();

    // Resolve table with fallback
    const primaryTable = process.env.SUPABASE_INVOICES_TABLE || 'invoices';
    const fallbackTable = primaryTable === 'invoices' ? 'Invoice' : 'invoices';

    let resolvedFilters: NormalisedFilters = {
      search: searchParam,
      statuses: normaliseStatusArray(statusFilters),
      categories: normaliseStringArray(categoryFilters),
      vendors: normaliseStringArray(vendorFilters),
      dateFrom: dateFromParam || undefined,
      dateTo: dateToParam || undefined,
      amountMin: amountMinParam ?? undefined,
      amountMax: amountMaxParam ?? undefined,
    };

    if (savedViewId) {
      const savedView = await loadSavedView(savedViewId);
      if (savedView) {
        resolvedFilters = mergeSavedViewFilters(resolvedFilters, savedView);
      }
    }

    if (!useSupabase) {
      // For local fixtures, honour explicit date filters but do not clamp to May 2025.
      const response = buildLocalInvoiceResponse(resolvedFilters, page, limit, sortBy, sortOrder, now);
      return NextResponse.json(response);
    }

    // Always clamp to May 1, 2025 to honour reporting baseline when using Supabase data
    const minClampDate = '2025-05-01T00:00:00.000Z';
    if (!resolvedFilters.dateFrom) {
      resolvedFilters.dateFrom = minClampDate;
    } else if (new Date(resolvedFilters.dateFrom) < new Date(minClampDate)) {
      resolvedFilters.dateFrom = minClampDate;
    }

    // Build query
    let query = supabaseAdmin
      .from(primaryTable)
      .select(
        `
          id,
          invoice_number,
          supplier_name,
          supplier_email,
          total,
          amount_due,
          invoice_date,
          due_date,
          description,
          category,
          payment_terms,
          file_url,
          source_url,
          created_at,
          paid_at
        `,
        { count: 'exact' }
      )
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    query = applyFilters(query, resolvedFilters, nowIso);

    let { data, error, count } = await query;
    // Fallback to alternate table name if table not found
    if (error && (error as any).code === 'PGRST205') {
      let fb = supabaseAdmin
        .from(fallbackTable)
        .select(
          `
            id,
            invoice_number,
            supplier_name,
            supplier_email,
            total,
            amount_due,
            invoice_date,
            due_date,
            description,
            category,
            payment_terms,
            file_url,
            source_url,
            created_at,
            paid_at
          `,
          { count: 'exact' }
        )
        .order(sortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + limit - 1);
      fb = applyFilters(fb, resolvedFilters, nowIso);

      const fbRes = await fb;
      data = fbRes.data as any[];
      error = fbRes.error as any;
      count = (fbRes as any).count as number;
    }

    if (error) {
      console.warn('Supabase error in /api/invoices, falling back to mock data:', error);
      const response = buildLocalInvoiceResponse(resolvedFilters, page, limit, sortBy, sortOrder, now);
      return NextResponse.json(response);
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
      status: deriveInvoiceStatus(row.amount_due, row.due_date, now),
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

type NormalisedFilters = {
  search: string
  statuses: string[]
  categories: string[]
  vendors: string[]
  dateFrom?: string
  dateTo?: string
  amountMin?: number
  amountMax?: number
}

function parseNullableNumber(value: string | null): number | null {
  if (value === null || value.trim() === '') {
    return null
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function normaliseStringArray(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)))
}

function normaliseStatusArray(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim().toLowerCase()).filter(Boolean)))
}

async function loadSavedView(id: string): Promise<InvoiceFiltersState | undefined> {
  try {
    const { data, error } = await supabaseAdmin
      .from('invoice_saved_views')
      .select('filters')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      console.warn('Failed to load saved view', error)
      return undefined
    }

    if (!data?.filters) {
      return undefined
    }

    return data.filters as InvoiceFiltersState
  } catch (error) {
    console.warn('Unexpected error retrieving saved view', error)
    return undefined
  }
}

function mergeSavedViewFilters(current: NormalisedFilters, savedView: InvoiceFiltersState): NormalisedFilters {
  return {
    search: current.search || savedView.search || '',
    statuses: current.statuses.length ? current.statuses : normaliseStatusArray(savedView.statuses ?? []),
    categories: current.categories.length ? current.categories : normaliseStringArray(savedView.categories ?? []),
    vendors: current.vendors.length ? current.vendors : normaliseStringArray(savedView.vendors ?? []),
    dateFrom: current.dateFrom ?? savedView.dateRange?.start ?? undefined,
    dateTo: current.dateTo ?? savedView.dateRange?.end ?? undefined,
    amountMin: current.amountMin ?? savedView.amountRange?.min ?? undefined,
    amountMax: current.amountMax ?? savedView.amountRange?.max ?? undefined,
  }
}

function applyFilters(query: any, filters: NormalisedFilters, nowIso: string) {
  let next = query

  if (filters.search) {
    const escaped = filters.search.replace(/[\\%_]/g, (match) => `\\${match}`)
    next = next.or(
      `invoice_number.ilike.%${escaped}%,supplier_name.ilike.%${escaped}%,supplier_email.ilike.%${escaped}%,description.ilike.%${escaped}%`
    )
  }

  if (filters.dateFrom) {
    next = next.gte('created_at', filters.dateFrom)
  }

  if (filters.dateTo) {
    next = next.lte('created_at', filters.dateTo)
  }

  if (filters.categories.length) {
    next = next.in('category', filters.categories)
  }

  if (filters.vendors.length) {
    next = next.in('supplier_name', filters.vendors)
  }

  if (typeof filters.amountMin === 'number') {
    next = next.gte('total', filters.amountMin)
  }

  if (typeof filters.amountMax === 'number') {
    next = next.lte('total', filters.amountMax)
  }

  if (filters.statuses.length > 0 && filters.statuses.length < 3) {
    const conditions = buildStatusConditions(filters.statuses, nowIso)
    if (conditions.length) {
      next = next.or(conditions.join(','))
    }
  }

  return next
}

function buildStatusConditions(statuses: string[], nowIso: string): string[] {
  const result: string[] = []
  const hasPending = statuses.includes('pending')
  const hasPaid = statuses.includes('paid')
  const hasOverdue = statuses.includes('overdue')

  if (hasPaid) {
    result.push('amount_due.eq.0')
  }

  if (hasOverdue) {
    result.push(`and(amount_due.gt.0,due_date.not.is.null,due_date.lt.${nowIso})`)
  }

  if (hasPending) {
    result.push(`and(or(amount_due.is.null,amount_due.gt.0),or(due_date.is.null,due_date.gte.${nowIso}))`)
  }

  return result
}

function deriveInvoiceStatus(amountDue: unknown, dueDate: unknown, now: Date): 'pending' | 'paid' | 'overdue' {
  const numericalAmount = typeof amountDue === 'number' ? amountDue : amountDue == null ? null : Number(amountDue)

  if (numericalAmount === 0) {
    return 'paid'
  }

  const dueDateValue = dueDate ? new Date(dueDate) : null

  if (numericalAmount != null && numericalAmount > 0 && dueDateValue && dueDateValue.getTime() < now.getTime()) {
    return 'overdue'
  }

  return 'pending'
}

function buildLocalInvoiceResponse(
  filters: NormalisedFilters,
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: 'asc' | 'desc',
  now: Date,
) {
  const filtered = filterLocalInvoices(mockInvoiceData, filters, now)
  const sorted = sortLocalInvoices(filtered, sortBy, sortOrder)
  const start = page * limit
  const end = start + limit
  const paginated = sorted.slice(start, end)

  const data = paginated.map((invoice) => ({
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    vendorName: invoice.vendorName,
    vendorEmail: invoice.vendorEmail ?? '',
    amount: invoice.amount ?? 0,
    amountDue: invoice.amountDue ?? invoice.amount ?? 0,
    issueDate: invoice.issueDate ?? null,
    dueDate: invoice.dueDate ?? null,
    status: deriveInvoiceStatus(invoice.amountDue ?? invoice.amount ?? 0, invoice.dueDate, now),
    description: invoice.description ?? '',
    category: invoice.category ?? 'Uncategorized',
    paymentTerms: invoice.paymentTerms ?? 'Net 30',
    invoiceUrl: invoice.invoiceUrl ?? '',
    receivedDate: invoice.receivedDate ?? invoice.issueDate ?? now.toISOString(),
    paidDate: invoice.paidDate ?? null,
  }))

  const total = filtered.length
  const pageCount = Math.ceil(total / limit) || 0

  return {
    data,
    pagination: {
      total,
      pageCount,
      pageSize: limit,
      pageIndex: page,
    },
  }
}

function filterLocalInvoices(invoices: typeof mockInvoiceData, filters: NormalisedFilters, now: Date) {
  return invoices.filter((invoice) => {
    if (filters.search) {
      const haystack = [
        invoice.invoiceNumber,
        invoice.vendorName,
        invoice.description,
        invoice.category,
      ]
        .filter(Boolean)
        .join(' ') 
        .toLowerCase()

      if (!haystack.includes(filters.search.toLowerCase())) {
        return false
      }
    }

    if (filters.statuses.length) {
      const derivedStatus = deriveInvoiceStatus(invoice.amountDue ?? invoice.amount ?? 0, invoice.dueDate, now)
      if (!filters.statuses.includes(derivedStatus)) {
        return false
      }
    }

    if (filters.categories.length) {
      const category = (invoice.category ?? '').toLowerCase()
      if (!filters.categories.some((value) => category === value.toLowerCase())) {
        return false
      }
    }

    if (filters.vendors.length) {
      const vendor = (invoice.vendorName ?? '').toLowerCase()
      if (!filters.vendors.some((value) => vendor === value.toLowerCase())) {
        return false
      }
    }

    if (filters.dateFrom || filters.dateTo) {
      const created = invoice.receivedDate ?? invoice.issueDate
      if (!created) return false
      const createdDate = new Date(created)

      if (filters.dateFrom && createdDate < new Date(filters.dateFrom)) {
        return false
      }

      if (filters.dateTo && createdDate > new Date(filters.dateTo)) {
        return false
      }
    }

    if (typeof filters.amountMin === 'number' && (invoice.amount ?? 0) < filters.amountMin) {
      return false
    }

    if (typeof filters.amountMax === 'number' && (invoice.amount ?? 0) > filters.amountMax) {
      return false
    }

    return true
  })
}

function sortLocalInvoices(
  invoices: typeof mockInvoiceData,
  sortBy: string,
  sortOrder: 'asc' | 'desc',
) {
  const factor = sortOrder === 'asc' ? 1 : -1
  const key = sortBy

  const sorted = [...invoices].sort((a, b) => {
    switch (key) {
      case 'created_at':
        return factor * compareDate(a.receivedDate ?? a.issueDate, b.receivedDate ?? b.issueDate)
      case 'invoice_number':
        return factor * compareString(a.invoiceNumber, b.invoiceNumber)
      case 'supplier_name':
        return factor * compareString(a.vendorName, b.vendorName)
      case 'total':
        return factor * compareNumber(a.amount ?? 0, b.amount ?? 0)
      case 'due_date':
        return factor * compareDate(a.dueDate, b.dueDate)
      case 'invoice_date':
        return factor * compareDate(a.issueDate, b.issueDate)
      case 'category':
        return factor * compareString(a.category, b.category)
      default:
        return 0
    }
  })

  return sorted
}

function compareString(a?: string | null, b?: string | null) {
  return (a ?? '').localeCompare(b ?? '')
}

function compareNumber(a: number, b: number) {
  return a - b
}

function compareDate(a?: string | null, b?: string | null) {
  const dateA = a ? new Date(a).getTime() : 0
  const dateB = b ? new Date(b).getTime() : 0
  return dateA - dateB
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
