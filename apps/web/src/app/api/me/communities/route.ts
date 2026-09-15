import { NextRequest, NextResponse } from 'next/server';
import { memberFromRequest } from '@community/auth';
import { listMyCommunities } from '@community/memberships';

export async function GET(req: NextRequest) {
  const member = await memberFromRequest(req);
  if (!member) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sessão inválida' } }, { status: 401 });
  }
  const data = await listMyCommunities(member.sub);
  return NextResponse.json({
    data: data.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      network_role: row.network_role,
    })),
  });
}
