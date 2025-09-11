export interface Invoice {
  // Primary key and core invoice fields
  invoice_number: string;
  invoice_date?: Date | string;
  due_date?: Date | string;
  currency?: string;
  subtotal?: number;
  gst_total?: number;
  total: number;
  amount_due?: number;
  
  // Supplier information
  supplier_name: string;
  supplier_abn?: string;
  supplier_email?: string;
  
  // Customer information  
  customer_name?: string;
  customer_abn?: string;
  
  // Banking details
  bank_bsb?: string;
  bank_account?: string;
  reference_hint?: string;
  
  // File information
  file_name?: string;
  file_url?: string;
  folder_path?: string;
  file_id?: string;
  folder_id?: string;
  
  // Processing metadata
  source?: string;
  notes?: string;
  confidence?: number;
  
  // Line item details (first line only)
  line_1_desc?: string;
  line_1_qty?: number;
  line_1_unit_price?: number;
  
  // Email information
  message_id?: string;
  email_subject?: string;
  email_from_name?: string;
  email_from_address?: string;
  
  // System timestamps
  created_at?: Date | string;
  updated_at?: Date | string;
}

export type InvoiceCategory = 'standard_pdf' | 'xero_with_pdf' | 'xero_links_only';

export type ProcessingStatus = 'Processed' | 'Needs Manual Download' | 'Pending' | 'Failed';

export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE';

// Helper type for legacy compatibility
export interface InvoiceLegacy {
  id: string;
  invoiceNumber: string;
  vendorName: string;
  vendorEmail?: string;
  amount: number;
  amountDue?: number;
  issueDate: Date;
  dueDate?: Date;
  status: PaymentStatus;
  description?: string;
  category?: string;
  paymentTerms?: string;
  invoiceUrl?: string;
  receivedDate?: Date;
  paidDate?: Date;
}

export interface DashboardStats {
  totalInvoices: number;
  totalAmount: number;
  pendingPayments: number;
  overduePayments: number;
  paidAmount: number;
  averageAmount: number;
}

export interface KanbanColumn {
  id: PaymentStatus;
  title: string;
  invoices: Invoice[];
}

export interface FilterOptions {
  status?: PaymentStatus[];
  category?: InvoiceCategory[];
  vendor?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  amountRange?: {
    min: number;
    max: number;
  };
}

export interface SortOption {
  field: keyof Invoice;
  direction: 'asc' | 'desc';
}

export type Theme = 'light' | 'dark' | 'system';