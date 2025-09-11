#!/usr/bin/env python3
"""
Extract All Excel Data - No Deduplication
Processes the current_invoices.xlsx file with correct column mappings:
- Total column for amounts
- Invoice date as date
- Supplier name for stakeholder who sent invoice
"""

import pandas as pd
import json
import os
from datetime import datetime
import sys

def extract_excel_data():
    print("🚀 Extracting ALL invoice data from Excel (no deduplication)...")
    
    # Input file path
    excel_file = '../data/current_invoices.xlsx'
    
    if not os.path.exists(excel_file):
        print(f"❌ Excel file not found: {excel_file}")
        return False
    
    try:
        # Read all sheets
        excel_data = pd.read_excel(excel_file, sheet_name=None)
        
        all_invoices = []
        total_records = 0
        
        for sheet_name, df in excel_data.items():
            # Skip Notes or empty sheets
            if 'Notes' in sheet_name or df.empty:
                continue
                
            print(f"📋 Processing sheet: {sheet_name}")
            print(f"   Columns found: {list(df.columns)}")
            
            sheet_records = 0
            
            for index, row in df.iterrows():
                # Skip empty rows
                if pd.isna(row.get('supplier_name', '')) or str(row.get('supplier_name', '')).strip() == '':
                    continue
                
                # Extract data using correct mappings
                invoice_data = {
                    'id': f"{sheet_name}-{index}",
                    'invoiceNumber': str(row.get('invoice_number', f'INV-{index}')),
                    'vendorName': str(row.get('supplier_name', '')),  # Supplier name as stakeholder
                    'vendorEmail': str(row.get('supplier_email', '')),
                    'amount': float(row.get('total', 0)) if pd.notna(row.get('total')) else 0,  # Total column for amounts
                    'amountDue': float(row.get('amount_due', 0)) if pd.notna(row.get('amount_due')) else 0,
                    'issueDate': row.get('invoice_date', datetime.now()).isoformat() if pd.notna(row.get('invoice_date')) else datetime.now().isoformat(),  # Invoice date as date
                    'dueDate': row.get('due_date', datetime.now()).isoformat() if pd.notna(row.get('due_date')) else datetime.now().isoformat(),
                    'status': determine_status(row),
                    'description': str(row.get('description', '')),
                    'category': str(row.get('category', sheet_name)),
                    'paymentTerms': str(row.get('payment_terms', 'Net 30')),
                    'invoiceUrl': str(row.get('invoice_url', '')),
                    'receivedDate': row.get('received_date', datetime.now()).isoformat() if pd.notna(row.get('received_date')) else datetime.now().isoformat(),
                    'paidDate': row.get('paid_date', None),
                    'source': sheet_name
                }
                
                # Convert paid_date to ISO string if it exists
                if pd.notna(invoice_data['paidDate']):
                    invoice_data['paidDate'] = invoice_data['paidDate'].isoformat()
                else:
                    invoice_data['paidDate'] = None
                
                all_invoices.append(invoice_data)
                sheet_records += 1
            
            print(f"   ✅ Extracted {sheet_records} records from {sheet_name}")
            total_records += sheet_records
        
        print(f"\n📊 TOTAL RECORDS EXTRACTED: {total_records} (NO DEDUPLICATION)")
        
        # Save to JSON file
        output_file = '../src/lib/consolidated-invoice-data.json'
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        with open(output_file, 'w') as f:
            json.dump(all_invoices, f, indent=2)
        
        print(f"💾 Saved consolidated data: {output_file}")
        print(f"📝 Contains {len(all_invoices)} invoice records from all sheets")
        
        # Generate summary
        print("\n📈 SUMMARY BY SOURCE:")
        sources = {}
        total_amount = 0
        for invoice in all_invoices:
            source = invoice['source']
            if source not in sources:
                sources[source] = {'count': 0, 'amount': 0}
            sources[source]['count'] += 1
            sources[source]['amount'] += invoice['amount']
            total_amount += invoice['amount']
        
        for source, data in sources.items():
            print(f"   {source}: {data['count']} invoices, ${data['amount']:,.2f}")
        
        print(f"\n💰 TOTAL VALUE: ${total_amount:,.2f}")
        return True
        
    except Exception as e:
        print(f"❌ Error processing Excel file: {str(e)}")
        return False

def determine_status(row):
    """Determine invoice status based on amounts and dates"""
    amount_due = float(row.get('amount_due', 0)) if pd.notna(row.get('amount_due')) else 0
    total = float(row.get('total', 0)) if pd.notna(row.get('total')) else 0
    due_date = row.get('due_date')
    
    # If amount due is 0 and total > 0, it's paid
    if amount_due == 0 and total > 0:
        return 'paid'
    
    # If due date has passed and amount due > 0, it's overdue
    if pd.notna(due_date) and due_date < datetime.now() and amount_due > 0:
        return 'overdue'
    
    # Otherwise it's pending
    return 'pending'

if __name__ == '__main__':
    success = extract_excel_data()
    sys.exit(0 if success else 1)