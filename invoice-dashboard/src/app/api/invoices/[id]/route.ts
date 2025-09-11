import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Update invoice
async function updateInvoiceHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const data = await request.json();
    const resolvedParams = await params;
    const invoiceNumber = resolvedParams.id; // Using invoice_number as ID
    
    // Get current invoice state
    const { data: currentInvoice, error: fetchError } = await supabaseAdmin
      .from('Invoice')
      .select('*')
      .eq('invoice_number', invoiceNumber)
      .single();
    
    if (fetchError || !currentInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    // Prepare update data - only update provided fields
    const updateData: any = {};
    
    // Core invoice fields
    if (data.invoice_date !== undefined) updateData.invoice_date = data.invoice_date;
    if (data.due_date !== undefined) updateData.due_date = data.due_date;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.subtotal !== undefined) updateData.subtotal = parseFloat(data.subtotal);
    if (data.gst_total !== undefined) updateData.gst_total = parseFloat(data.gst_total);
    if (data.total !== undefined) updateData.total = parseFloat(data.total);
    if (data.amount_due !== undefined) updateData.amount_due = parseFloat(data.amount_due);
    
    // Supplier information
    if (data.supplier_name !== undefined) updateData.supplier_name = data.supplier_name;
    if (data.supplier_abn !== undefined) updateData.supplier_abn = data.supplier_abn;
    if (data.supplier_email !== undefined) updateData.supplier_email = data.supplier_email;
    
    // Customer information
    if (data.customer_name !== undefined) updateData.customer_name = data.customer_name;
    if (data.customer_abn !== undefined) updateData.customer_abn = data.customer_abn;
    
    // Banking details
    if (data.bank_bsb !== undefined) updateData.bank_bsb = data.bank_bsb;
    if (data.bank_account !== undefined) updateData.bank_account = data.bank_account;
    if (data.reference_hint !== undefined) updateData.reference_hint = data.reference_hint;
    
    // File information
    if (data.file_name !== undefined) updateData.file_name = data.file_name;
    if (data.file_url !== undefined) updateData.file_url = data.file_url;
    if (data.folder_path !== undefined) updateData.folder_path = data.folder_path;
    if (data.file_id !== undefined) updateData.file_id = data.file_id;
    if (data.folder_id !== undefined) updateData.folder_id = data.folder_id;
    
    // Processing metadata
    if (data.source !== undefined) updateData.source = data.source;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.confidence !== undefined) updateData.confidence = parseFloat(data.confidence);
    
    // Line item details
    if (data.line_1_desc !== undefined) updateData.line_1_desc = data.line_1_desc;
    if (data.line_1_qty !== undefined) updateData.line_1_qty = parseFloat(data.line_1_qty);
    if (data.line_1_unit_price !== undefined) updateData.line_1_unit_price = parseFloat(data.line_1_unit_price);
    
    // Email information
    if (data.message_id !== undefined) updateData.message_id = data.message_id;
    if (data.email_subject !== undefined) updateData.email_subject = data.email_subject;
    if (data.email_from_name !== undefined) updateData.email_from_name = data.email_from_name;
    if (data.email_from_address !== undefined) updateData.email_from_address = data.email_from_address;
    
    // Always update the updated_at timestamp
    updateData.updated_at = new Date().toISOString();
    
    // Update invoice in database
    const { data: updatedInvoice, error: updateError } = await supabaseAdmin
      .from('Invoice')
      .update(updateData)
      .eq('invoice_number', invoiceNumber)
      .select()
      .single();
    
    if (updateError) {
      console.error('Supabase update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update invoice' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      invoice: updatedInvoice,
    });
    
  } catch (error) {
    console.error('Failed to update invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

// Get single invoice
async function getInvoiceHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const invoiceNumber = resolvedParams.id; // Using invoice_number as ID
    
    const { data: invoice, error } = await supabaseAdmin
      .from('Invoice')
      .select('*')
      .eq('invoice_number', invoiceNumber)
      .single();
    
    if (error || !invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(invoice);
    
  } catch (error) {
    console.error('Failed to get invoice:', error);
    return NextResponse.json(
      { error: 'Failed to get invoice' },
      { status: 500 }
    );
  }
}

// Delete invoice
async function deleteInvoiceHandler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const invoiceNumber = resolvedParams.id; // Using invoice_number as ID
    
    // Check if invoice exists
    const { data: currentInvoice, error: fetchError } = await supabaseAdmin
      .from('Invoice')
      .select('*')
      .eq('invoice_number', invoiceNumber)
      .single();
    
    if (fetchError || !currentInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    // For this implementation, we'll do a hard delete
    // In production, you might want to implement soft delete
    const { error: deleteError } = await supabaseAdmin
      .from('Invoice')
      .delete()
      .eq('invoice_number', invoiceNumber);
    
    if (deleteError) {
      console.error('Supabase delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete invoice' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Invoice deleted successfully',
    });
    
  } catch (error) {
    console.error('Failed to delete invoice:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}

// Export handlers
export const GET = getInvoiceHandler;
export const PATCH = updateInvoiceHandler;
export const DELETE = deleteInvoiceHandler;