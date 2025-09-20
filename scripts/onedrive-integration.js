#!/usr/bin/env node
/**
 * OneDrive Integration for Invoice Dashboard
 * Automatically monitors and processes Excel files from OneDrive
 * Optimized for small business with daily updates
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // OneDrive settings (to be configured)
  onedrive: {
    clientId: process.env.ONEDRIVE_CLIENT_ID || '',
    clientSecret: process.env.ONEDRIVE_CLIENT_SECRET || '',
    tenantId: process.env.ONEDRIVE_TENANT_ID || '',
    refreshToken: process.env.ONEDRIVE_REFRESH_TOKEN || '',
    
    // File monitoring
    fileId: process.env.ONEDRIVE_FILE_ID || '', // The Excel file ID in OneDrive
    fileName: 'current-invoices.xlsx',
    checkInterval: 15 * 60 * 1000, // Check every 15 minutes
  },
  
  // Local settings
  local: {
    downloadDir: '/Users/niteshsure/Documents/todo/invoice-dashboard/data/onedrive',
    processedDir: '/Users/niteshsure/Documents/todo/invoice-dashboard/data/processed',
    logFile: '/Users/niteshsure/Documents/todo/invoice-dashboard/logs/onedrive-sync.log',
    lastSyncFile: '/Users/niteshsure/Documents/todo/invoice-dashboard/data/.last-sync',
  },
  
  // Lightsail settings
  lightsail: {
    host: '13.54.176.108',
    user: 'ubuntu',
    keyPath: '~/.ssh/lightsail_n8n.pem',
    remoteDir: '/home/ubuntu/invoice-processing'
  }
};

// Logger utility
class Logger {
  constructor(logFile) {
    this.logFile = logFile;
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };
    
    const logLine = JSON.stringify(logEntry) + '\n';
    fs.appendFileSync(this.logFile, logLine);
    
    // Also log to console
    console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }

  info(message, data = null) { this.log('info', message, data); }
  error(message, data = null) { this.log('error', message, data); }
  warn(message, data = null) { this.log('warn', message, data); }
}

// OneDrive API Client
class OneDriveClient {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
    this.accessToken = null;
    this.tokenExpires = 0;
  }

  // Get access token using refresh token
  async getAccessToken() {
    if (this.accessToken && Date.now() < this.tokenExpires) {
      return this.accessToken;
    }

    try {
      this.logger.info('Refreshing OneDrive access token...');
      
      const tokenData = new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: this.config.refreshToken,
        grant_type: 'refresh_token'
      });

      const response = await this.makeRequest({
        hostname: 'login.microsoftonline.com',
        path: `/${this.config.tenantId}/oauth2/v2.0/token`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(tokenData.toString())
        }
      }, tokenData.toString());

      const data = JSON.parse(response);
      
      if (data.access_token) {
        this.accessToken = data.access_token;
        this.tokenExpires = Date.now() + (data.expires_in * 1000) - 60000; // 1 min buffer
        this.logger.info('Access token refreshed successfully');
        return this.accessToken;
      } else {
        throw new Error('Failed to get access token: ' + JSON.stringify(data));
      }
    } catch (error) {
      this.logger.error('Failed to refresh access token', { error: error.message });
      throw error;
    }
  }

  // Check if file has been modified since last sync
  async checkFileModified() {
    try {
      const token = await this.getAccessToken();
      
      const response = await this.makeRequest({
        hostname: 'graph.microsoft.com',
        path: `/v1.0/me/drive/items/${this.config.fileId}`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const fileInfo = JSON.parse(response);
      const lastModified = new Date(fileInfo.lastModifiedDateTime);
      
      // Check against last sync time
      const lastSyncTime = this.getLastSyncTime();
      const isModified = lastModified > lastSyncTime;
      
      this.logger.info('File modification check', {
        fileName: fileInfo.name,
        lastModified: lastModified.toISOString(),
        lastSync: lastSyncTime.toISOString(),
        isModified
      });

      return {
        isModified,
        fileInfo,
        lastModified
      };
      
    } catch (error) {
      this.logger.error('Failed to check file modification', { error: error.message });
      throw error;
    }
  }

  // Download file from OneDrive
  async downloadFile(outputPath) {
    try {
      const token = await this.getAccessToken();
      
      this.logger.info(`Downloading file from OneDrive to: ${outputPath}`);
      
      const response = await this.makeRequest({
        hostname: 'graph.microsoft.com',
        path: `/v1.0/me/drive/items/${this.config.fileId}/content`,
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }, null, true); // Binary response

      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Save file
      fs.writeFileSync(outputPath, response);
      
      this.logger.info(`File downloaded successfully: ${outputPath}`);
      return outputPath;
      
    } catch (error) {
      this.logger.error('Failed to download file', { error: error.message });
      throw error;
    }
  }

  // Get last sync time
  getLastSyncTime() {
    try {
      if (fs.existsSync(CONFIG.local.lastSyncFile)) {
        const lastSyncString = fs.readFileSync(CONFIG.local.lastSyncFile, 'utf8');
        return new Date(lastSyncString.trim());
      }
    } catch (error) {
      this.logger.warn('Could not read last sync time', { error: error.message });
    }
    
    // Default to 24 hours ago
    return new Date(Date.now() - 24 * 60 * 60 * 1000);
  }

  // Update last sync time
  updateLastSyncTime(time = null) {
    try {
      const syncTime = time || new Date();
      fs.writeFileSync(CONFIG.local.lastSyncFile, syncTime.toISOString());
      this.logger.info(`Last sync time updated: ${syncTime.toISOString()}`);
    } catch (error) {
      this.logger.error('Failed to update last sync time', { error: error.message });
    }
  }

  // HTTP request helper
  makeRequest(options, postData = null, binary = false) {
    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        const chunks = [];

        if (binary) {
          res.on('data', (chunk) => {
            chunks.push(chunk);
          });
        } else {
          res.setEncoding('utf8');
          res.on('data', (chunk) => {
            data += chunk;
          });
        }

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(binary ? Buffer.concat(chunks) : data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (postData) {
        req.write(postData);
      }

      req.end();
    });
  }
}

// Main OneDrive Monitor
class OneDriveMonitor {
  constructor() {
    this.logger = new Logger(CONFIG.local.logFile);
    this.client = new OneDriveClient(CONFIG.onedrive, this.logger);
    this.isRunning = false;
  }

  // Start monitoring
  async start() {
    if (this.isRunning) {
      this.logger.warn('Monitor is already running');
      return;
    }

    this.logger.info('Starting OneDrive monitor...');
    this.isRunning = true;

    // Initial check
    await this.checkAndProcess();

    // Set up periodic checks
    this.intervalId = setInterval(() => {
      this.checkAndProcess().catch(error => {
        this.logger.error('Error in periodic check', { error: error.message });
      });
    }, CONFIG.onedrive.checkInterval);

    this.logger.info(`Monitor started, checking every ${CONFIG.onedrive.checkInterval / 60000} minutes`);
  }

  // Stop monitoring
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    this.logger.info('OneDrive monitor stopped');
  }

  // Check for changes and process
  async checkAndProcess() {
    try {
      this.logger.info('Checking for file changes...');

      // Check if file has been modified
      const { isModified, fileInfo, lastModified } = await this.client.checkFileModified();

      if (!isModified) {
        this.logger.info('No changes detected, skipping processing');
        return { processed: false, reason: 'no_changes' };
      }

      this.logger.info('File changes detected, processing...');

      // Download updated file
      const timestamp = new Date().toISOString().split('T')[0];
      const downloadPath = path.join(CONFIG.local.downloadDir, `${timestamp}-${CONFIG.onedrive.fileName}`);
      
      await this.client.downloadFile(downloadPath);

      // Process the file
      const processingResult = await this.processDownloadedFile(downloadPath);

      // Update last sync time
      this.client.updateLastSyncTime(lastModified);

      // Upload to Lightsail if needed
      await this.uploadToLightsail(processingResult.outputFiles);

      // Notify stakeholders
      await this.sendNotification({
        type: 'file_processed',
        fileName: fileInfo.name,
        lastModified: lastModified.toISOString(),
        stats: processingResult.stats
      });

      return {
        processed: true,
        fileInfo,
        stats: processingResult.stats
      };

    } catch (error) {
      this.logger.error('Error in check and process', { error: error.message, stack: error.stack });
      
      // Send error notification
      await this.sendNotification({
        type: 'processing_error',
        error: error.message,
        timestamp: new Date().toISOString()
      });

      throw error;
    }
  }

  // Process downloaded Excel file
  async processDownloadedFile(filePath) {
    this.logger.info(`Processing downloaded file: ${filePath}`);

    // Import the processing logic from our earlier script
    const { processInvoiceData } = require('./simple-excel-processor');
    
    // Mock processing for now - you would integrate with your actual Excel processor
    const result = {
      stats: {
        totalProcessed: 15,
        totalAmount: 5234.75,
        bySource: {
          tab1: { count: 5, amount: 1234.50 },
          tab2: { count: 6, amount: 2000.00 },
          tab3: { count: 4, amount: 2000.25 }
        }
      },
      outputFiles: {
        json: path.join(CONFIG.local.processedDir, `invoices-${Date.now()}.json`),
        csv: path.join(CONFIG.local.processedDir, `invoices-${Date.now()}.csv`),
        summary: path.join(CONFIG.local.processedDir, `summary-${Date.now()}.json`)
      }
    };

    // Create mock output files
    Object.values(result.outputFiles).forEach(file => {
      const dir = path.dirname(file);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(file, JSON.stringify(result.stats, null, 2));
    });

    this.logger.info('File processing completed', result.stats);
    return result;
  }

  // Upload processed files to Lightsail
  async uploadToLightsail(outputFiles) {
    try {
      this.logger.info('Uploading processed files to Lightsail...');
      
      // Use SCP to upload files (simplified for now)
      const { exec } = require('child_process');
      const util = require('util');
      const execAsync = util.promisify(exec);

      for (const [type, filePath] of Object.entries(outputFiles)) {
        const fileName = path.basename(filePath);
        const remoteFilePath = `${CONFIG.lightsail.remoteDir}/${fileName}`;
        
        const command = `scp -i ${CONFIG.lightsail.keyPath} "${filePath}" ${CONFIG.lightsail.user}@${CONFIG.lightsail.host}:${remoteFilePath}`;
        
        try {
          await execAsync(command);
          this.logger.info(`Uploaded ${type} file: ${fileName}`);
        } catch (error) {
          this.logger.warn(`Failed to upload ${type} file`, { error: error.message });
        }
      }

    } catch (error) {
      this.logger.error('Failed to upload to Lightsail', { error: error.message });
    }
  }

  // Send notification
  async sendNotification(data) {
    try {
      this.logger.info('Sending notification', data);
      
      // You can integrate with email, Slack, etc.
      // For now, just log the notification
      
    } catch (error) {
      this.logger.error('Failed to send notification', { error: error.message });
    }
  }
}

// Setup function for OneDrive integration
async function setupOneDriveIntegration() {
  console.log('🔧 OneDrive Integration Setup');
  console.log('==============================\n');

  // Check if configuration exists
  const requiredEnvVars = [
    'ONEDRIVE_CLIENT_ID',
    'ONEDRIVE_CLIENT_SECRET', 
    'ONEDRIVE_TENANT_ID',
    'ONEDRIVE_REFRESH_TOKEN',
    'ONEDRIVE_FILE_ID'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    console.log('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      console.log(`   • ${varName}`);
    });
    
    console.log('\n📋 Setup Instructions:');
    console.log('   1. Create an app in Azure AD');
    console.log('   2. Get the OneDrive file sharing URL');
    console.log('   3. Set up environment variables');
    console.log('   4. Run the setup script');
    console.log('\nSee setup guide: ./docs/ONEDRIVE_SETUP.md');
    return false;
  }

  // Test connection
  try {
    const monitor = new OneDriveMonitor();
    const testResult = await monitor.client.checkFileModified();
    
    console.log('✅ OneDrive connection successful!');
    console.log(`   File: ${testResult.fileInfo.name}`);
    console.log(`   Last modified: ${testResult.lastModified.toISOString()}`);
    console.log(`   Needs update: ${testResult.isModified}`);
    
    return true;
    
  } catch (error) {
    console.log('❌ OneDrive connection failed:', error.message);
    return false;
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  switch (command) {
    case 'setup':
      await setupOneDriveIntegration();
      break;
      
    case 'start':
      const monitor = new OneDriveMonitor();
      await monitor.start();
      
      // Keep process running
      process.on('SIGINT', () => {
        console.log('\n⏹️  Stopping OneDrive monitor...');
        monitor.stop();
        process.exit(0);
      });
      break;
      
    case 'check':
      const checkMonitor = new OneDriveMonitor();
      const result = await checkMonitor.checkAndProcess();
      console.log('Check result:', result);
      break;
      
    case 'help':
    default:
      console.log(`
📁 OneDrive Integration for Invoice Dashboard

Usage:
  node onedrive-integration.js [command]

Commands:
  setup     - Test OneDrive connection and validate setup
  start     - Start monitoring OneDrive for changes  
  check     - Run one-time check for changes
  help      - Show this help message

Environment Variables Required:
  ONEDRIVE_CLIENT_ID       - Azure AD App Client ID
  ONEDRIVE_CLIENT_SECRET   - Azure AD App Client Secret  
  ONEDRIVE_TENANT_ID       - Your tenant ID
  ONEDRIVE_REFRESH_TOKEN   - OAuth refresh token
  ONEDRIVE_FILE_ID         - OneDrive file ID to monitor

Examples:
  node onedrive-integration.js setup
  node onedrive-integration.js start
`);
      break;
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { OneDriveMonitor, OneDriveClient, setupOneDriveIntegration };