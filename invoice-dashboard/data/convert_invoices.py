#!/usr/bin/env python3
import csv
from datetime import datetime
import re
from collections import defaultdict

# File paths
input_file = '/Users/niteshsure/Documents/todo/invoice-dashboard/data/invoice_data_since_2024'
output_file = '/Users/niteshsure/Documents/todo/invoice-dashboard/data/invoices_cleaned_2024.csv'

# Function to clean amount strings
def clean_amount(amount_str):
    if not amount_str or amount_str == '':
        return 0.0
    # Remove dollar signs, commas, and convert to float
    amount_str = str(amount_str).replace('$', '').replace(',', '')
    try:
        return float(amount_str)
    except:
        return 0.0

# Function to format date for ISO format
def format_date(date_str):
    if not date_str or date_str == '':
        return ''
    try:
        # Try parsing format: 4-Sep-25
        months = {'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
                  'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12}
        
        parts = date_str.split('-')
        if len(parts) == 3:
            day = int(parts[0])
            month = months.get(parts[1], 1)
            year = int(parts[2])
            # Assume 20xx for two-digit years
            if year < 100:
                year = 2000 + year
            
            date_obj = datetime(year, month, day)
            return date_obj.strftime('%Y-%m-%dT%H:%M:%S.000Z')
    except:
        pass
    return date_str

# Read the TSV file
print("Reading invoice data...")
rows = []
seen_message_ids = set()
duplicate_count = 0

with open(input_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter='\t')
    
    for row in reader:
        message_id = row.get('message_id', '')
        
        # Skip if we've seen this message_id before (remove duplicates)
        if message_id and message_id in seen_message_ids:
            duplicate_count += 1
            continue
        
        if message_id:
            seen_message_ids.add(message_id)
        rows.append(row)

print(f"Original records: {len(rows) + duplicate_count}")
print(f"Duplicates removed: {duplicate_count}")
print(f"Unique records: {len(rows)}")

# Process and convert the data
output_data = []
vendor_stats = defaultdict(int)
total_amount = 0
category_stats = defaultdict(int)
status_stats = defaultdict(int)

for row in rows:
    # Determine category based on source
    category = 'standard_pdf'
    email_from = str(row.get('email_from_address', '')).lower()
    if 'xero' in email_from:
        if row.get('file_url', ''):
            category = 'xero_with_pdf'
        else:
            category = 'xero_links_only'
    
    category_stats[category] += 1
    
    # Determine processing status
    processing_status = 'Processed'
    if not row.get('file_url', ''):
        if category == 'xero_links_only':
            processing_status = 'Needs Manual Download'
    
    status_stats[processing_status] += 1
    
    # Build the email subject if it's empty
    email_subject = row.get('email_subject', '')
    if not email_subject:
        invoice_num = row.get('invoice_number', '')
        supplier = row.get('supplier_name', '')
        customer = row.get('customer_name', '')
        email_subject = f"Invoice {invoice_num} from {supplier} for {customer}"
    
    # Get vendor name
    vendor = row.get('supplier_name', '')
    if not vendor:
        vendor = row.get('email_from_name', 'Unknown Vendor')
    
    vendor_stats[vendor] += 1
    
    # Clean up OneDrive link
    onedrive_link = row.get('file_url', '')
    if not onedrive_link:
        onedrive_link = ''
    
    # Create Xero link if from Xero
    xero_link = ''
    if 'xero' in email_from:
        invoice_num = row.get('invoice_number', '')
        if invoice_num:
            xero_link = f"https://go.xero.com/invoice/{invoice_num}"
    
    # Format the received date (using invoice_date as proxy)
    received_date = format_date(row.get('invoice_date', ''))
    if not received_date:
        received_date = datetime.now().strftime('%Y-%m-%dT%H:%M:%S.000Z')
    
    # Calculate amount
    amount = clean_amount(row.get('total', row.get('amount_due', 0)))
    total_amount += amount
    
    # Create the output row
    output_row = {
        'Email_ID': row.get('message_id', ''),
        'Subject': email_subject,
        'From_Email': row.get('email_from_address', ''),
        'From_Name': row.get('email_from_name', vendor),
        'Received_Date': received_date,
        'Category': category,
        'Invoice_Number': row.get('invoice_number', ''),
        'Amount': amount,
        'Vendor': vendor,
        'Due_Date': format_date(row.get('due_date', '')),
        'OneDrive_Link': onedrive_link,
        'Xero_Link': xero_link,
        'Processing_Status': processing_status,
        'Processed_At': format_date(row.get('invoice_date', ''))
    }
    
    output_data.append(output_row)

# Sort by received date (newest first)
output_data.sort(key=lambda x: x['Received_Date'], reverse=True)

# Write to CSV
print(f"\nWriting cleaned data to: {output_file}")
with open(output_file, 'w', newline='', encoding='utf-8') as f:
    fieldnames = ['Email_ID', 'Subject', 'From_Email', 'From_Name', 'Received_Date', 
                  'Category', 'Invoice_Number', 'Amount', 'Vendor', 'Due_Date', 
                  'OneDrive_Link', 'Xero_Link', 'Processing_Status', 'Processed_At']
    
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(output_data)

print(f"\n✅ Successfully created cleaned CSV file!")
print(f"Total unique invoices: {len(output_data)}")

# Display summary statistics
print("\n=== Summary Statistics ===")
print(f"Total Amount: ${total_amount:,.2f}")
if len(output_data) > 0:
    print(f"Average Invoice: ${total_amount/len(output_data):,.2f}")
print(f"Number of Vendors: {len(vendor_stats)}")

print(f"\nTop 5 Vendors by Invoice Count:")
sorted_vendors = sorted(vendor_stats.items(), key=lambda x: x[1], reverse=True)
for vendor, count in sorted_vendors[:5]:
    print(f"  {vendor}: {count} invoices")

print(f"\nProcessing Status:")
for status, count in status_stats.items():
    print(f"  {status}: {count}")

print(f"\nCategory Distribution:")
for category, count in category_stats.items():
    print(f"  {category}: {count}")