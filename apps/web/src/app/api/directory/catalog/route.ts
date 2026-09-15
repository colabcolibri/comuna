import { NextRequest, NextResponse } from 'next/server';
import { memberFromRequest } from '@community/auth';
import { listDirectoryCatalog } from '@/lib/server/directory-catalog';
import { activeMembership } from '@/lib/server/membership';

export async function GET(req: NextRequest) {
  const member = await memberFromRequest(req);
  if (!member) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sessão inválida' } }, { status: 401 });
  }
  const membership = await activeMembership(member.sub);
  if (!membership) {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Sem membership ativa' } }, { status: 403 });
  }
  const listed = await listDirectoryCatalog({ userId: member.sub, communityId: membership.community_id });
  return NextResponse.json(listed.body, { status: listed.status });
}
