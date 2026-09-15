import { NextRequest, NextResponse } from 'next/server';
import { listNetworkPeople } from '@community/memberships';
import { isOpsClaims, requireOps } from '@/lib/require-ops';

export async function GET(req: NextRequest) {
  const ops = await requireOps(req);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const data = await listNetworkPeople();
  return NextResponse.json({ data });
}
