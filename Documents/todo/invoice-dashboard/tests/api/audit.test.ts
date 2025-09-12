import { describe, it, expect } from '@jest/globals';

// API Contract Tests for Audit Endpoint
describe('/api/audit', () => {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  describe('GET /api/audit', () => {
    it('should return paginated audit logs with correct structure', async () => {
      const response = await fetch(`${baseUrl}/api/audit`);
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
      
      // Check audit log structure if any logs exist
      if (data.data.length > 0) {
        const auditLog = data.data[0];
        expect(auditLog).toHaveProperty('id');
        expect(auditLog).toHaveProperty('entityType');
        expect(auditLog).toHaveProperty('entityId');
        expect(auditLog).toHaveProperty('action');
        expect(auditLog).toHaveProperty('changes');
        expect(auditLog).toHaveProperty('createdAt');
        expect(auditLog).toHaveProperty('userId');
        expect(auditLog).toHaveProperty('user');
        
        // Check user structure if present
        if (auditLog.user) {
          expect(auditLog.user).toHaveProperty('id');
          expect(auditLog.user).toHaveProperty('firstName');
          expect(auditLog.user).toHaveProperty('lastName');
          expect(auditLog.user).toHaveProperty('email');
        }
      }
    });

    it('should support filtering by entity type', async () => {
      const response = await fetch(`${baseUrl}/api/audit?entityType=invoice`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
      
      // If there are results, they should match the filter
      data.data.forEach((log: any) => {
        expect(log.entityType).toBe('invoice');
      });
    });

    it('should support filtering by entity ID', async () => {
      const entityId = 'TEST-INVOICE-123';
      const response = await fetch(`${baseUrl}/api/audit?entityId=${entityId}`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
      
      // If there are results, they should match the filter
      data.data.forEach((log: any) => {
        expect(log.entityId).toBe(entityId);
      });
    });

    it('should support filtering by user ID', async () => {
      const userId = 'user-123';
      const response = await fetch(`${baseUrl}/api/audit?userId=${userId}`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
      
      // If there are results, they should match the filter
      data.data.forEach((log: any) => {
        expect(log.userId).toBe(userId);
      });
    });

    it('should support filtering by action', async () => {
      const action = 'CREATE';
      const response = await fetch(`${baseUrl}/api/audit?action=${action}`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
      
      // If there are results, they should match the filter
      data.data.forEach((log: any) => {
        expect(log.action).toBe(action);
      });
    });

    it('should support date range filtering', async () => {
      const dateFrom = '2025-01-01';
      const dateTo = '2025-12-31';
      const response = await fetch(`${baseUrl}/api/audit?dateFrom=${dateFrom}&dateTo=${dateTo}`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
      
      // Check that all returned logs are within the date range
      data.data.forEach((log: any) => {
        const logDate = new Date(log.createdAt);
        const fromDate = new Date(dateFrom);
        const toDate = new Date(dateTo);
        expect(logDate >= fromDate).toBe(true);
        expect(logDate <= toDate).toBe(true);
      });
    });

    it('should support pagination parameters', async () => {
      const page = 1;
      const limit = 5;
      const response = await fetch(`${baseUrl}/api/audit?page=${page}&limit=${limit}`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.pagination.pageIndex).toBe(page);
      expect(data.pagination.pageSize).toBe(limit);
      expect(data.data.length).toBeLessThanOrEqual(limit);
    });

    it('should support type filtering (recent, entity, user)', async () => {
      const type = 'recent';
      const response = await fetch(`${baseUrl}/api/audit?type=${type}`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
      
      // For 'recent' type, results should be sorted by createdAt DESC
      if (data.data.length > 1) {
        for (let i = 1; i < data.data.length; i++) {
          const current = new Date(data.data[i].createdAt);
          const previous = new Date(data.data[i - 1].createdAt);
          expect(current <= previous).toBe(true);
        }
      }
    });

    it('should return valid data types', async () => {
      const response = await fetch(`${baseUrl}/api/audit`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      
      // Check pagination data types
      expect(typeof data.pagination.total).toBe('number');
      expect(typeof data.pagination.pageCount).toBe('number');
      expect(typeof data.pagination.pageSize).toBe('number');
      expect(typeof data.pagination.pageIndex).toBe('number');
      
      // Check audit log data types if any exist
      if (data.data.length > 0) {
        const log = data.data[0];
        expect(typeof log.id).toBe('string');
        expect(typeof log.entityType).toBe('string');
        expect(typeof log.entityId).toBe('string');
        expect(typeof log.action).toBe('string');
        expect(typeof log.createdAt).toBe('string');
        
        // userId can be null
        if (log.userId !== null) {
          expect(typeof log.userId).toBe('string');
        }
        
        // changes can be any type (object, array, etc.)
        expect(log.changes).toBeDefined();
      }
    });

    it('should handle errors with correct format', async () => {
      // This would need a way to trigger a server error in real implementation
      const response = await fetch(`${baseUrl}/api/audit?triggerError=true`);
      
      if (response.status === 500) {
        const error = await response.json();
        expect(error).toHaveProperty('code', 'SERVER_ERROR');
        expect(error).toHaveProperty('message', 'Failed to get audit logs');
        expect(typeof error.message).toBe('string');
      }
    });

    it('should return empty results for filters with no matches', async () => {
      const response = await fetch(`${baseUrl}/api/audit?entityId=NON_EXISTENT_ENTITY`);
      const data = await response.json();
      
      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(0);
      expect(data.pagination.total).toBe(0);
      expect(data.pagination.pageCount).toBe(0);
    });
  });
});