# 📊 Invoice Data Upload Directory

## 📁 File Structure

Place your consolidated Excel spreadsheet here with the following structure:

```
/Users/niteshsure/Documents/todo/invoice-dashboard/data/
├── current-invoices.xlsx          # Your main spreadsheet with 3 tabs
├── archive/                       # Backup/historical files
├── templates/                     # Excel templates for future use
└── processed/                     # Auto-processed files (system managed)
```

## 📋 Excel File Requirements

### File Name
- **Primary file**: `current-invoices.xlsx`
- **Backup files**: `invoices-backup-YYYY-MM-DD.xlsx`

### Tab Structure Expected
1. **Tab 1**: `Workflow1_Data` or similar
2. **Tab 2**: `Workflow2_Data` or similar  
3. **Tab 3**: `Workflow3_Data` or similar

### Required Columns (each tab should have these headers):
- `Email_ID` - Unique identifier from email
- `Subject` - Email subject line
- `From_Email` - Sender email address
- `From_Name` - Sender name
- `Received_Date` - When email was received
- `Category` - Invoice category/type
- `Invoice_Number` - Unique invoice number
- `Amount` - Invoice amount (numeric)
- `Vendor` - Vendor/supplier name
- `Due_Date` - Payment due date
- `OneDrive_Link` - Link to stored PDF
- `Xero_Link` - Link to Xero invoice
- `Processing_Status` - Current status
- `Processed_At` - Processing timestamp

## 🔄 How the System Works

1. **Upload**: Place your Excel file in this directory
2. **Detection**: System automatically detects new/modified files
3. **Processing**: Each tab is processed and mapped to `source_tab` field
4. **Consolidation**: Data is merged into unified database
5. **Dashboard**: View consolidated data in web interface

## 📝 Small Business Optimized Settings

Given your requirements (4 users, ~250 invoices):
- **Database**: SQLite for simplicity (can upgrade to PostgreSQL later)
- **Authentication**: Simple JWT-based auth (no AWS Cognito needed)
- **Storage**: Local file storage (no S3 needed initially)
- **Hosting**: Single Lightsail instance (no load balancer needed)

## 🚀 Quick Start

1. Copy your current spreadsheet to this directory as `current-invoices.xlsx`
2. Run the data migration script:
   ```bash
   cd /Users/niteshsure/Documents/todo/invoice-dashboard
   npm run migrate:data
   ```
3. Start the application:
   ```bash
   npm run dev
   ```
4. Access dashboard at: `http://localhost:3000`

## 📊 Sample Data Format

If you need a template, here's the expected format:

| Email_ID | Subject | From_Email | Invoice_Number | Amount | Vendor | Due_Date |
|----------|---------|------------|----------------|--------|--------|----------|
| MSG001 | Invoice INV-1264 | billing@vendor.com | INV-1264 | 1012.0 | Vendor Ltd | 2025-01-15 |

## 🔐 Security Notes

- Files in this directory are excluded from version control
- Sensitive data is encrypted in the database
- Regular backups are created automatically
- Access is restricted to authenticated users only

## 📞 Support

If you encounter issues with file format or upload:
1. Check the error logs: `logs/data-processing.log`
2. Verify column headers match exactly
3. Ensure dates are in proper format (YYYY-MM-DD)
4. Contact support with specific error messages