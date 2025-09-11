import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuditTrail, getRecentActivity, getUserActivity } from '@/lib/audit-service';

// Get audit logs with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Filter parameters
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '0', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    
    // Special query types
    const queryType = searchParams.get('type'); // 'recent', 'entity', 'user'
    
    let auditLogs;
    
    if (queryType === 'recent') {
      // Get recent activity across all entities
      auditLogs = await getRecentActivity(limit);
      return NextResponse.json({
        data: auditLogs,
        pagination: {
          total: auditLogs.length,
          pageCount: 1,
          pageSize: limit,
          pageIndex: 0,
        }
      });
    }
    
    if (queryType === 'entity' && entityType && entityId) {
      // Get audit trail for specific entity
      auditLogs = await getAuditTrail(entityType, entityId, limit);
      return NextResponse.json({
        data: auditLogs,
        pagination: {
          total: auditLogs.length,
          pageCount: 1,
          pageSize: limit,
          pageIndex: 0,
        }
      });
    }
    
    if (queryType === 'user' && userId) {
      // Get activity for specific user
      auditLogs = await getUserActivity(userId, limit);
      return NextResponse.json({
        data: auditLogs,
        pagination: {
          total: auditLogs.length,
          pageCount: 1,
          pageSize: limit,
          pageIndex: 0,
        }
      });
    }
    
    // General audit log query with filters
    const where: any = {};
    
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (userId) where.userId = userId;
    if (action) where.action = action;
    
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }
    
    // Get total count
    const total = await prisma.auditLog.count({ where });
    
    // Get paginated results
    auditLogs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: page * limit,
      take: limit,
    });
    
    const pageCount = Math.ceil(total / limit);
    
    return NextResponse.json({
      data: auditLogs,
      pagination: {
        total,
        pageCount,
        pageSize: limit,
        pageIndex: page,
      }
    });
    
  } catch (error) {
    console.error('Failed to get audit logs:', error);
    return NextResponse.json(
      { error: 'Failed to get audit logs' },
      { status: 500 }
    );
  }
}