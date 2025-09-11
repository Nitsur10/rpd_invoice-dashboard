import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { Invoice } from '@/lib/types';

// Get invoices with server-side filtering, sorting, and pagination
async function getInvoicesHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    
    // Sorting parameters
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Filter parameters
    const invoiceNumberFilter = searchParams.get('invoiceNumber');
    const supplierFilter = searchParams.get('supplier');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');
    
    // Build Supabase query
    let query = supabaseAdmin
      .from('Invoice')
      .select('*', { count: 'exact' });
    
    // Apply filters
    if (invoiceNumberFilter) {
      query = query.ilike('invoice_number', `%${invoiceNumberFilter}%`);
    }
    
    if (supplierFilter) {
      query = query.ilike('supplier_name', `%${supplierFilter}%`);
    }
    
    if (dateFrom) {
      query = query.gte('invoice_date', dateFrom);
    }
    
    if (dateTo) {
      query = query.lte('invoice_date', dateTo);
    }
    
    if (minAmount) {
      query = query.gte('total', parseFloat(minAmount));
    }
    
    if (maxAmount) {
      query = query.lte('total', parseFloat(maxAmount));
    }
    
    // Apply sorting
    const validSortFields = ['invoice_number', 'supplier_name', 'total', 'invoice_date', 'due_date', 'created_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const ascending = sortOrder === 'asc';
    
    query = query.order(sortField, { ascending });
    
    // Apply pagination
    const rangeStart = page * limit;
    const rangeEnd = rangeStart + limit - 1;
    query = query.range(rangeStart, rangeEnd);
    
    // Execute query
    const { data: invoices, error, count } = await query;
    
    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { error: 'Failed to load invoices' },
        { status: 500 }
      );
    }
    
    // Calculate pagination info
    const total = count || 0;
    const pageCount = Math.ceil(total / limit);
    
    return NextResponse.json({
      data: invoices,
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
      { error: 'Failed to load invoices' },
      { status: 500 }
    );
  }
}

// Export GET handler
export const GET = getInvoicesHandler;

// Create new invoice
async function createInvoiceHandler(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['invoice_number', 'total', 'supplier_name'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Create invoice in database using Supabase
    const { data: newInvoice, error } = await supabaseAdmin
      .from('Invoice')
      .insert({
        invoice_number: data.invoice_number,
        invoice_date: data.invoice_date || null,
        due_date: data.due_date || null,
        currency: data.currency || null,
        subtotal: data.subtotal || null,
        gst_total: data.gst_total || null,
        total: parseFloat(data.total),
        amount_due: data.amount_due || null,
        supplier_name: data.supplier_name,
        supplier_abn: data.supplier_abn || null,
        supplier_email: data.supplier_email || null,
        customer_name: data.customer_name || null,
        customer_abn: data.customer_abn || null,
        bank_bsb: data.bank_bsb || null,
        bank_account: data.bank_account || null,
        reference_hint: data.reference_hint || null,
        file_name: data.file_name || null,
        file_url: data.file_url || null,
        folder_path: data.folder_path || null,
        file_id: data.file_id || null,
        folder_id: data.folder_id || null,
        source: data.source || null,
        notes: data.notes || null,
        confidence: data.confidence || null,
        line_1_desc: data.line_1_desc || null,
        line_1_qty: data.line_1_qty || null,
        line_1_unit_price: data.line_1_unit_price || null,
        message_id: data.message_id || null,
        email_subject: data.email_subject || null,
        email_from_name: data.email_from_name || null,
        email_from_address: data.email_from_address || null,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Supabase insert error:', error);
      
      // Handle specific Supabase errors
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json(
          { error: 'Invoice with this number already exists' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to create invoice' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(newInvoice, { status: 201 });
    
  } catch (error) {
    console.error('Failed to create invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}

// Export POST handler
export const POST = createInvoiceHandler;