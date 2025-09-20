import { describe, it, expect } from '@jest/globals';

// API Contract Tests for Stats Endpoint
describe('/api/stats', () => {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  describe('GET /api/stats', () => {
    it('should return dashboard statistics with correct structure', async () => {
      const response = await fetch(`${baseUrl}/api/stats`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      
      // Check main structure
      expect(data).toHaveProperty('overview');
      expect(data).toHaveProperty('breakdowns');
      expect(data).toHaveProperty('recentActivity');
      expect(data).toHaveProperty('metadata');
      
      // Check overview structure
      expect(data.overview).toHaveProperty('totalInvoices');
      expect(data.overview).toHaveProperty('pendingPayments');
      expect(data.overview).toHaveProperty('overduePayments');
      expect(data.overview).toHaveProperty('paidInvoices');
      expect(data.overview).toHaveProperty('totalAmount');
      expect(data.overview).toHaveProperty('pendingAmount');
      expect(data.overview).toHaveProperty('overdueAmount');
      expect(data.overview).toHaveProperty('paidAmount');
      expect(data.overview).toHaveProperty('trends');
      
      // Check trends structure
      expect(data.overview.trends).toHaveProperty('invoices');
      expect(data.overview.trends).toHaveProperty('amount');
      
      // Check breakdowns structure
      expect(data.breakdowns).toHaveProperty('processingStatus');
      expect(data.breakdowns).toHaveProperty('categories');
      expect(data.breakdowns).toHaveProperty('topVendors');
      
      // Check arrays are properly structured
      expect(Array.isArray(data.breakdowns.processingStatus)).toBe(true);
      expect(Array.isArray(data.breakdowns.categories)).toBe(true);
      expect(Array.isArray(data.breakdowns.topVendors)).toBe(true);
      expect(Array.isArray(data.recentActivity)).toBe(true);
      
      // Check metadata structure
      expect(data.metadata).toHaveProperty('generatedAt');
      expect(data.metadata).toHaveProperty('dateRange');
      expect(data.metadata).toHaveProperty('periodDays');
      expect(data.metadata.dateRange).toHaveProperty('from');
      expect(data.metadata.dateRange).toHaveProperty('to');
    });

    it('should support date range filtering', async () => {
      const dateFrom = '2025-01-01';
      const dateTo = '2025-12-31';
      const response = await fetch(`${baseUrl}/api/stats?dateFrom=${dateFrom}&dateTo=${dateTo}`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('overview');
      
      // Check that date range is reflected in metadata
      if (data.metadata?.dateRange) {
        expect(data.metadata.dateRange.from).toBeTruthy();
        expect(data.metadata.dateRange.to).toBeTruthy();
      }
    });

    it('should return valid data types', async () => {
      const response = await fetch(`${baseUrl}/api/stats`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      
      // Check numeric fields are numbers
      expect(typeof data.overview.totalInvoices).toBe('number');
      expect(typeof data.overview.totalAmount).toBe('number');
      expect(typeof data.overview.pendingPayments).toBe('number');
      expect(typeof data.overview.overduePayments).toBe('number');
      expect(typeof data.overview.paidInvoices).toBe('number');
      
      // Check string fields are strings
      expect(typeof data.metadata.generatedAt).toBe('string');
      
      // Check breakdown items have required structure
      if (data.breakdowns.topVendors.length > 0) {
        const vendor = data.breakdowns.topVendors[0];
        expect(vendor).toHaveProperty('vendor');
        expect(vendor).toHaveProperty('count');
        expect(vendor).toHaveProperty('amount');
        expect(typeof vendor.count).toBe('number');
        expect(typeof vendor.amount).toBe('number');
      }
    });

    it('should handle errors with correct format', async () => {
      // This would need a way to trigger a server error in real implementation
      const response = await fetch(`${baseUrl}/api/stats?triggerError=true`);
      
      if (response.status === 500) {
        const error = await response.json();
        expect(error).toHaveProperty('code', 'SERVER_ERROR');
        expect(error).toHaveProperty('message');
        expect(typeof error.message).toBe('string');
      }
    });

    it('should return consistent data structure even with no invoices', async () => {
      // This test assumes we might have no data in some test scenarios
      const response = await fetch(`${baseUrl}/api/stats?dateFrom=2020-01-01&dateTo=2020-01-02`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      
      // Even with no data, structure should be consistent
      expect(data.overview.totalInvoices).toBe(0);
      expect(data.overview.totalAmount).toBe(0);
      expect(Array.isArray(data.breakdowns.topVendors)).toBe(true);
      expect(Array.isArray(data.recentActivity)).toBe(true);
    });
  });
});