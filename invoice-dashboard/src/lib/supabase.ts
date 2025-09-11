import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client (browser)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client with service role key
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Type definitions for our database
export type Database = {
  public: {
    Tables: {
      Invoice: {
        Row: {
          // Core invoice fields from spreadsheet
          invoice_number: string
          invoice_date: string | null
          due_date: string | null
          currency: string | null
          subtotal: number | null
          gst_total: number | null
          total: number
          amount_due: number | null
          
          // Supplier information
          supplier_name: string
          supplier_abn: string | null
          supplier_email: string | null
          
          // Customer information  
          customer_name: string | null
          customer_abn: string | null
          
          // Banking details
          bank_bsb: string | null
          bank_account: string | null
          reference_hint: string | null
          
          // File information
          file_name: string | null
          file_url: string | null
          folder_path: string | null
          file_id: string | null
          folder_id: string | null
          
          // Processing metadata
          source: string | null
          notes: string | null
          confidence: number | null
          
          // Line item details (first line only)
          line_1_desc: string | null
          line_1_qty: number | null
          line_1_unit_price: number | null
          
          // Email information
          message_id: string | null
          email_subject: string | null
          email_from_name: string | null
          email_from_address: string | null
          
          // System timestamps
          created_at: string
          updated_at: string
        }
        Insert: {
          // Core invoice fields from spreadsheet
          invoice_number: string
          invoice_date?: string | null
          due_date?: string | null
          currency?: string | null
          subtotal?: number | null
          gst_total?: number | null
          total: number
          amount_due?: number | null
          
          // Supplier information
          supplier_name: string
          supplier_abn?: string | null
          supplier_email?: string | null
          
          // Customer information  
          customer_name?: string | null
          customer_abn?: string | null
          
          // Banking details
          bank_bsb?: string | null
          bank_account?: string | null
          reference_hint?: string | null
          
          // File information
          file_name?: string | null
          file_url?: string | null
          folder_path?: string | null
          file_id?: string | null
          folder_id?: string | null
          
          // Processing metadata
          source?: string | null
          notes?: string | null
          confidence?: number | null
          
          // Line item details (first line only)
          line_1_desc?: string | null
          line_1_qty?: number | null
          line_1_unit_price?: number | null
          
          // Email information
          message_id?: string | null
          email_subject?: string | null
          email_from_name?: string | null
          email_from_address?: string | null
          
          // System timestamps
          created_at?: string
          updated_at?: string
        }
        Update: {
          // Core invoice fields from spreadsheet
          invoice_number?: string
          invoice_date?: string | null
          due_date?: string | null
          currency?: string | null
          subtotal?: number | null
          gst_total?: number | null
          total?: number
          amount_due?: number | null
          
          // Supplier information
          supplier_name?: string
          supplier_abn?: string | null
          supplier_email?: string | null
          
          // Customer information  
          customer_name?: string | null
          customer_abn?: string | null
          
          // Banking details
          bank_bsb?: string | null
          bank_account?: string | null
          reference_hint?: string | null
          
          // File information
          file_name?: string | null
          file_url?: string | null
          folder_path?: string | null
          file_id?: string | null
          folder_id?: string | null
          
          // Processing metadata
          source?: string | null
          notes?: string | null
          confidence?: number | null
          
          // Line item details (first line only)
          line_1_desc?: string | null
          line_1_qty?: number | null
          line_1_unit_price?: number | null
          
          // Email information
          message_id?: string | null
          email_subject?: string | null
          email_from_name?: string | null
          email_from_address?: string | null
          
          // System timestamps
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          entityType: string
          entityId: string
          action: string
          userId: string | null
          changes: any
          ipAddress: string | null
          userAgent: string | null
          createdAt: string
        }
        Insert: {
          id?: string
          entityType: string
          entityId: string
          action: string
          userId?: string | null
          changes: any
          ipAddress?: string | null
          userAgent?: string | null
          createdAt?: string
        }
        Update: {
          id?: string
          entityType?: string
          entityId?: string
          action?: string
          userId?: string | null
          changes?: any
          ipAddress?: string | null
          userAgent?: string | null
          createdAt?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          password: string
          firstName: string
          lastName: string
          role: 'ADMIN' | 'EMPLOYEE' | 'CLIENT' | 'VIEWER'
          isActive: boolean
          createdAt: string
          updatedAt: string
        }
        Insert: {
          id?: string
          email: string
          password: string
          firstName: string
          lastName: string
          role?: 'ADMIN' | 'EMPLOYEE' | 'CLIENT' | 'VIEWER'
          isActive?: boolean
          createdAt?: string
          updatedAt?: string
        }
        Update: {
          id?: string
          email?: string
          password?: string
          firstName?: string
          lastName?: string
          role?: 'ADMIN' | 'EMPLOYEE' | 'CLIENT' | 'VIEWER'
          isActive?: boolean
          createdAt?: string
          updatedAt?: string
        }
      }
    }
  }
}