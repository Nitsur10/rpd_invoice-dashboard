import { NextRequest, NextResponse } from 'next/server';

// Temporary stub to fix build error
async function getAuditHandler(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '0', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

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

export const GET = getAuditHandler;