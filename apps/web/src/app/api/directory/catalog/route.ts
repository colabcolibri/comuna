import { NextRequest, NextResponse } from 'next/server';
import { listDirectoryCatalog } from '@/lib/server/directory-catalog';
import { memberCommunityFromRequest } from '@/lib/server/member-community';

export async function GET(req: NextRequest) {
  const resolved = await memberCommunityFromRequest(req);
  if (!resolved.ok) {
    return resolved.response;
  }
  const listed = await listDirectoryCatalog({ userId: resolved.userId, communityId: resolved.seat.id });
  return NextResponse.json(listed.body, { status: listed.status });
}
