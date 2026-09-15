import { NextRequest, NextResponse } from 'next/server';
import { memberFromRequest } from '@community/auth';
import { COMMUNITY_COOKIE } from '@community/communities';
import { listMyCommunities, pickCommunitySeat, type MyCommunity } from '@community/memberships';

export async function memberCommunityFromRequest(req: NextRequest): Promise<
  | { ok: true; userId: string; seat: MyCommunity }
  | { ok: false; response: NextResponse }
> {
  const member = await memberFromRequest(req);
  if (!member) {
    return {
      ok: false,
      response: NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sessão inválida' } }, { status: 401 }),
    };
  }
  const seats = await listMyCommunities(member.sub);
  const picked = pickCommunitySeat(seats, req.cookies.get(COMMUNITY_COOKIE)?.value);
  if (!picked.ok) {
    const status = picked.code === 'VALIDATION_ERROR' ? 400 : 403;
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: {
            code: picked.code,
            message:
              picked.code === 'VALIDATION_ERROR'
                ? 'Escolha uma comunidade'
                : 'Sem membership ativa nesta comunidade',
          },
        },
        { status }
      ),
    };
  }
  return { ok: true, userId: member.sub, seat: picked.seat };
}
