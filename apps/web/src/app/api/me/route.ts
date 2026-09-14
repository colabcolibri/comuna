import { NextRequest, NextResponse } from 'next/server';
import { memberFromRequest } from '@community/auth';
import { query } from '@community/db';

export async function GET(req: NextRequest) {
  const member = await memberFromRequest(req);
  if (!member) {
    return NextResponse.json({ user: null });
  }
  const membership = await query<{ network_role: string; community_id: string }>(
    `SELECT network_role, community_id FROM network_core.memberships
     WHERE user_id = $1 AND network_status = 'active'
     ORDER BY joined_at DESC LIMIT 1`,
    [member.sub]
  );
  return NextResponse.json({
    user: {
      email: member.email,
      global_role: member.global_role,
      network_role: membership.rows[0]?.network_role ?? null,
    },
  });
}
