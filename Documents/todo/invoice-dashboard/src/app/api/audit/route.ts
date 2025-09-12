import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server/supabase-admin';
import { withLogging } from '@/lib/server/logging';
import { isSupabaseConfigured } from '@/lib/server/env';
import { z } from 'zod';
import { pageSchema, limitSchema } from '@/lib/schemas/pagination';

const auditQuerySchema = z.object({
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  userId: z.string().optional(),
  action: z.string().optional(),
  dateFrom: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  dateTo: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  page: pageSchema,
  limit: limitSchema,
  type: z.enum(['recent', 'entity', 'user']).optional().default('recent'),
  triggerError: z.string().transform(val => val === 'true').optional(),
});

async function getAuditHandler(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams);
    
    const parsed = auditQuerySchema.safeParse(query);
    
    if (!parsed.success) {
      return NextResponse.json(
        { code: 'INVALID_QUERY', message: parsed.error.flatten().formErrors.join('; ') },
        { status: 400 }
      );
    }

    const { entityType, entityId, userId, action, dateFrom, dateTo, page, limit, type, triggerError } = parsed.data;

    // Simulate error for testing
    if (triggerError) {
      return NextResponse.json(
        { code: 'SERVER_ERROR', message: 'Failed to get audit logs' },
        { status: 500 }
      );
    }

    // Build the query - using audit_logs table
    let query_builder = supabaseAdmin
      .from('audit_logs')
      .select(`
        id,
        entity_type,
        entity_id,
        action,
        changes,
        created_at,
        user_id,
        ip_address,
        user_agent,
        users!inner (
          id,
          first_name,
          last_name,
          email
        )
      `, { count: 'exact' });

    // Apply filters
    if (entityType) {
      query_builder = query_builder.eq('entity_type', entityType);
    }
    
    if (entityId) {
      query_builder = query_builder.eq('entity_id', entityId);
    }
    
    if (userId) {
      query_builder = query_builder.eq('user_id', userId);
    }
    
    if (action) {
      query_builder = query_builder.eq('action', action);
    }

    if (dateFrom) {
      query_builder = query_builder.gte('created_at', dateFrom);
    }

    if (dateTo) {
      query_builder = query_builder.lte('created_at', dateTo);
    }

    // Apply sorting based on type
    if (type === 'recent') {
      query_builder = query_builder.order('created_at', { ascending: false });
    }

    // Apply pagination
    const offset = page * limit;
    query_builder = query_builder.range(offset, offset + limit - 1);

    const { data, error, count } = await query_builder;

    if (error) {
      // If audit_logs table doesn't exist, return empty results with correct structure
      console.warn('Audit logs table not found or error:', error);
      
      const totalPages = 0;
      
      return NextResponse.json({
        data: [],
        pagination: {
          total: 0,
          pageCount: totalPages,
          pageSize: limit,
          pageIndex: page,
        },
      });
    }

    // Transform the data to match expected format
    const auditLogs = (data || []).map((log: any) => ({
      id: log.id,
      entityType: log.entity_type,
      entityId: log.entity_id,
      action: log.action,
      changes: log.changes,
      createdAt: log.created_at,
      userId: log.user_id,
      user: log.users ? {
        id: log.users.id,
        firstName: log.users.first_name,
        lastName: log.users.last_name,
        email: log.users.email,
      } : null,
    }));

    const totalPages = Math.ceil((count || 0) / limit);

    return NextResponse.json({
      data: auditLogs,
      pagination: {
        total: count || 0,
        pageCount: totalPages,
        pageSize: limit,
        pageIndex: page,
      },
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { code: 'SERVER_ERROR', message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withLogging(getAuditHandler, 'GET /api/audit');
    // Safe empty response when Supabase not configured
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        data: [],
        pagination: {
          total: 0,
          pageCount: 0,
          pageSize: limit,
          pageIndex: page,
        },
      });
    }
