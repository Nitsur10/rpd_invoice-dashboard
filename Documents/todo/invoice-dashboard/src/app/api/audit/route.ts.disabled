import { NextRequest, NextResponse } from 'next/server';
// Temporarily disabled to fix Prisma build error
// import { supabaseAdmin } from '@/lib/server/supabase-admin';
// import { withLogging } from '@/lib/server/logging';
// import { isSupabaseConfigured } from '@/lib/server/env';
import { z } from 'zod';
// import { pageSchema, limitSchema } from '@/lib/schemas/pagination';

// Temporary stub to fix Prisma build error
async function getAuditHandler(request: NextRequest) {
  return NextResponse.json({
    data: [],
    pagination: {
      total: 0,
      pageCount: 0,
      pageSize: 20,
      pageIndex: 0,
    },
  });
}

export const GET = getAuditHandler;
