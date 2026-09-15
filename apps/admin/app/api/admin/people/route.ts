import { NextRequest, NextResponse } from 'next/server';
import { OPS_LIST_LIMIT, listNetworkPeople } from '@community/memberships';
import { isOpsClaims, requireOps } from '@/lib/require-ops';

export async function GET(req: NextRequest) {
  const ops = await requireOps(req);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const q = req.nextUrl.searchParams.get('q') || '';
  const offset = Math.max(0, Number(req.nextUrl.searchParams.get('offset') || '0') || 0);
  const data = await listNetworkPeople({ q, offset });
  return NextResponse.json({ data, meta: { hasMore: data.length === OPS_LIST_LIMIT } });
}
