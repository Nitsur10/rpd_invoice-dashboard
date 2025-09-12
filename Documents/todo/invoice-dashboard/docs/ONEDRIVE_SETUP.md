# 🔗 OneDrive Integration Setup Guide

## 📋 Overview
This guide helps you set up automatic synchronization with your OneDrive Excel file, eliminating the need for daily manual uploads.

## 🎯 Benefits
- ✅ **Automatic daily updates** - No manual file uploads needed
- ✅ **Real-time processing** - Updates processed within 15 minutes
- ✅ **Version tracking** - Maintains history of all changes
- ✅ **Error handling** - Automatic retries and notifications

## 🔧 Setup Methods

### Method 1: Simple Sharing URL (Recommended for Small Business)

This is the easiest method and works great for your 4-user setup:

#### Step 1: Share Your Excel File
1. Open your Excel file in OneDrive
2. Click **"Share"** in the top right
3. Click **"Copy link"** 
4. Choose **"Anyone with the link can edit"** (for your team access)
5. Copy the sharing URL

#### Step 2: Extract File Information
The URL will look like:
```
https://onedrive.live.com/edit.aspx?resid=ABC123&cid=XYZ789&app=Excel
```

Extract:
- **File ID**: The `resid=ABC123` part
- **User ID**: The `cid=XYZ789` part

#### Step 3: Configure Environment
Create a `.env` file in your project directory:
```bash
# OneDrive Configuration
ONEDRIVE_SHARING_URL=https://onedrive.live.com/edit.aspx?resid=ABC123&cid=XYZ789&app=Excel
ONEDRIVE_FILE_ID=ABC123
ONEDRIVE_USER_ID=XYZ789

# Processing Settings
CHECK_INTERVAL_MINUTES=15
NOTIFICATION_EMAIL=your@email.com
```

#### Step 4: Test Connection
```bash
cd /Users/niteshsure/Documents/todo/invoice-dashboard
node scripts/onedrive-integration.js setup
```

---

### Method 2: Microsoft Graph API (Enterprise Setup)

For more advanced features and better security:

#### Step 1: Create Azure AD Application
1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **"New registration"**
4. Name: "Invoice Dashboard OneDrive Integration"
5. Account types: **"Accounts in this organizational directory only"**
6. Redirect URI: `http://localhost:8080/auth/callback`

#### Step 2: Configure Permissions
1. Go to **API Permissions**
2. Add these Microsoft Graph permissions:
   - `Files.Read` (Delegated)
   - `Files.Read.All` (Application)
   - `Sites.Read.All` (Application)

#### Step 3: Get Client Credentials
1. Go to **Certificates & secrets**
2. Create a **"New client secret"**
3. Copy the **Client ID** and **Client Secret**

#### Step 4: Get Refresh Token
Run the authentication helper:
```bash
node scripts/get-onedrive-token.js
```

#### Step 5: Configure Environment
```bash
# Azure AD Configuration
ONEDRIVE_CLIENT_ID=your-client-id
ONEDRIVE_CLIENT_SECRET=your-client-secret
ONEDRIVE_TENANT_ID=your-tenant-id
ONEDRIVE_REFRESH_TOKEN=your-refresh-token

# File Configuration
ONEDRIVE_FILE_ID=your-file-id
ONEDRIVE_FILE_NAME=current-invoices.xlsx

# Processing Settings
CHECK_INTERVAL_MINUTES=15
```

---

## 🚀 Quick Setup Script

I'll create a simple setup script for you:

```bash
#!/bin/bash
# OneDrive Quick Setup for Small Business

echo "🔗 OneDrive Integration Setup"
echo "============================="

# Get OneDrive sharing URL
echo ""
echo "📋 Step 1: Get your OneDrive sharing URL"
echo "   1. Open your Excel file in OneDrive"
echo "   2. Click 'Share' → 'Copy link'"
echo "   3. Choose 'Anyone with the link can edit'"
echo ""
read -p "🔗 Paste your OneDrive sharing URL: " SHARING_URL

# Extract file information
if [[ $SHARING_URL =~ resid=([^&]+) ]]; then
    FILE_ID="${BASH_REMATCH[1]}"
    echo "✅ Extracted File ID: $FILE_ID"
else
    echo "❌ Could not extract file ID from URL"
    exit 1
fi

# Create environment file
cat > .env << EOF
# OneDrive Configuration - Generated $(date)
ONEDRIVE_SHARING_URL=$SHARING_URL
ONEDRIVE_FILE_ID=$FILE_ID

# Processing Settings
CHECK_INTERVAL_MINUTES=15
NOTIFICATION_EMAIL=${USER}@company.com

# Lightsail Settings  
LIGHTSAIL_HOST=13.54.176.108
LIGHTSAIL_USER=ubuntu
LIGHTSAIL_KEY=~/.ssh/lightsail_n8n.pem
EOF

echo ""
echo "✅ Configuration saved to .env"
echo ""
echo "🧪 Testing connection..."

# Test the setup
node scripts/onedrive-integration.js setup

echo ""
echo "🎉 Setup complete! You can now start monitoring:"
echo "   node scripts/onedrive-integration.js start"
```

## 📊 Monitoring & Operations

### Start Monitoring
```bash
# Start continuous monitoring
node scripts/onedrive-integration.js start

# Run in background
nohup node scripts/onedrive-integration.js start > onedrive.log 2>&1 &
```

### Check Status
```bash
# One-time check
node scripts/onedrive-integration.js check

# View logs
tail -f logs/onedrive-sync.log
```

### Deploy to Lightsail
```bash
# Upload monitoring script to your Lightsail instance
scp -i ~/.ssh/lightsail_n8n.pem scripts/onedrive-integration.js ubuntu@13.54.176.108:~/
scp -i ~/.ssh/lightsail_n8n.pem .env ubuntu@13.54.176.108:~/

# Start monitoring on Lightsail
ssh -i ~/.ssh/lightsail_n8n.pem ubuntu@13.54.176.108 "cd ~ && nohup node onedrive-integration.js start > onedrive.log 2>&1 &"
```

## 🔔 Notifications

### Email Notifications (Optional)
Add to your `.env`:
```bash
# Email Configuration
NOTIFICATION_EMAIL=team@company.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notifications@company.com
SMTP_PASS=your-app-password
```

### Slack Notifications (Optional)
```bash
# Slack Configuration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SLACK_CHANNEL=#invoice-alerts
```

## 🛡️ Security Best Practices

1. **Limit Access**: Use "Specific people" sharing instead of "Anyone with link" for production
2. **Regular Rotation**: Rotate API tokens every 90 days
3. **Monitor Access**: Review OneDrive access logs regularly
4. **Backup Strategy**: Maintain local backups of processed data

## 📈 Scaling Up

As your business grows, you can:
- **Add Multiple Files**: Monitor multiple Excel files
- **Real-time Updates**: Use Microsoft Graph webhooks for instant updates
- **Advanced Processing**: Integrate with Power Automate workflows
- **Team Permissions**: Set up role-based OneDrive access

## 🆘 Troubleshooting

### Common Issues

**"File not found" error:**
- Verify the sharing URL is correct
- Check file permissions
- Ensure file hasn't been moved or renamed

**"Authentication failed" error:**
- Refresh your access tokens
- Verify client credentials
- Check Azure AD app permissions

**"Processing failed" error:**
- Check Excel file format
- Verify all required columns are present
- Review error logs for details

### Log Locations
- **Local**: `/Users/niteshsure/Documents/todo/invoice-dashboard/logs/onedrive-sync.log`
- **Lightsail**: `/home/ubuntu/onedrive.log`

### Support Commands
```bash
# View detailed logs
cat logs/onedrive-sync.log | jq '.'

# Check file permissions
node -e "console.log(require('./scripts/onedrive-integration.js').checkPermissions())"

# Reset configuration
rm .env && node scripts/onedrive-integration.js setup
```

## 🎯 Next Steps

Once OneDrive integration is working:

1. **Set up your dashboard** for the 4 users
2. **Configure payment status updates** 
3. **Add notification preferences**
4. **Schedule regular backups**
5. **Train your team** on the new workflow

This automation will save you hours each week and ensure your invoice data is always current!