import { NextRequest, NextResponse } from 'next/server';
import { listDirectoryMembers } from '@/lib/server/directory-members';
import { memberCommunityFromRequest } from '@/lib/server/member-community';

export async function GET(req: NextRequest) {
  const resolved = await memberCommunityFromRequest(req);
  if (!resolved.ok) {
    return resolved.response;
  }
  const listed = await listDirectoryMembers(
    { userId: resolved.userId, communityId: resolved.seat.id },
    req.nextUrl.searchParams
  );
  return NextResponse.json(listed.body, { status: listed.status });
}
