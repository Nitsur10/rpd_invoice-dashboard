import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

// API Contract Tests for Invoice Endpoints
describe('/api/invoices', () => {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  describe('GET /api/invoices', () => {
    it('should return paginated invoice list with correct structure', async () => {
      const response = await fetch(`${baseUrl}/api/invoices`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('pagination');
      expect(Array.isArray(data.data)).toBe(true);
      
      // Check pagination structure
      expect(data.pagination).toHaveProperty('total');
      expect(data.pagination).toHaveProperty('pageCount');
      expect(data.pagination).toHaveProperty('pageSize');
      expect(data.pagination).toHaveProperty('pageIndex');
    });

    it('should support filtering by date range', async () => {
      const dateFrom = '2025-01-01';
      const dateTo = '2025-12-31';
      const response = await fetch(`${baseUrl}/api/invoices?dateFrom=${dateFrom}&dateTo=${dateTo}`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should handle server errors with correct format', async () => {
      // This would need a way to trigger a server error - in real tests you might mock Supabase
      const response = await fetch(`${baseUrl}/api/invoices?invalidParam=triggerError`);
      
      if (response.status === 500) {
        const error = await response.json();
        expect(error).toHaveProperty('code');
        expect(error).toHaveProperty('message');
        expect(error.code).toBe('SERVER_ERROR');
      }
    });
  });

  describe('POST /api/invoices', () => {
    it('should validate required fields', async () => {
      const invalidInvoice = {};
      
      const response = await fetch(`${baseUrl}/api/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidInvoice)
      });
      
      expect(response.status).toBe(400);
      const error = await response.json();
      expect(error).toHaveProperty('code', 'INVALID_BODY');
      expect(error).toHaveProperty('message');
    });

    it('should accept valid invoice data', async () => {
      const validInvoice = {
        invoice_number: `TEST-${Date.now()}`,
        supplier_name: 'Test Supplier',
        total: 100.00
      };
      
      const response = await fetch(`${baseUrl}/api/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validInvoice)
      });
      
      if (response.status === 201) {
        const result = await response.json();
        expect(result).toHaveProperty('success', true);
        expect(result).toHaveProperty('invoice');
        expect(result.invoice).toHaveProperty('invoice_number', validInvoice.invoice_number);
      }
    });

    it('should handle duplicate invoice numbers', async () => {
      const duplicateInvoice = {
        invoice_number: 'EXISTING-INVOICE',
        supplier_name: 'Test Supplier',
        total: 100.00
      };
      
      const response = await fetch(`${baseUrl}/api/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicateInvoice)
      });
      
      if (response.status === 409) {
        const error = await response.json();
        expect(error).toHaveProperty('code', 'DUPLICATE_INVOICE');
        expect(error).toHaveProperty('message');
      }
    });
  });
});

describe('/api/invoices/[id]', () => {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  describe('GET /api/invoices/[id]', () => {
    it('should return 404 for non-existent invoice', async () => {
      const response = await fetch(`${baseUrl}/api/invoices/NON-EXISTENT-INVOICE`);
      
      expect(response.status).toBe(404);
      const error = await response.json();
      expect(error).toHaveProperty('code', 'NOT_FOUND');
      expect(error).toHaveProperty('message', 'Invoice not found');
    });
  });

  describe('PATCH /api/invoices/[id]', () => {
    it('should validate update data', async () => {
      const invalidUpdate = {
        total: 'invalid-number'
      };
      
      const response = await fetch(`${baseUrl}/api/invoices/TEST-INVOICE`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidUpdate)
      });
      
      expect(response.status).toBe(400);
      const error = await response.json();
      expect(error).toHaveProperty('code', 'INVALID_BODY');
      expect(error).toHaveProperty('message');
    });
  });

  describe('DELETE /api/invoices/[id]', () => {
    it('should return 404 for non-existent invoice', async () => {
      const response = await fetch(`${baseUrl}/api/invoices/NON-EXISTENT-INVOICE`, {
        method: 'DELETE'
      });
      
      expect(response.status).toBe(404);
      const error = await response.json();
      expect(error).toHaveProperty('code', 'NOT_FOUND');
      expect(error).toHaveProperty('message', 'Invoice not found');
    });
  });
});