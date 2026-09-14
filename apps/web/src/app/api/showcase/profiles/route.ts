import { NextResponse } from 'next/server';
import { query } from '@community/db';
import { moduleRuntime } from '@/lib/server/membership';

export async function GET() {
  const community = await query<{ id: string }>(
    `SELECT id FROM network_core.communities WHERE is_public_showcase = true ORDER BY created_at LIMIT 1`
  );
  const communityId = community.rows[0]?.id;
  if (!communityId) {
    return NextResponse.json({ data: [] });
  }
  const on = await moduleRuntime.isEnabled(communityId, 'showcase');
  if (!on) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Módulo desligado' } }, { status: 404 });
  }
  const result = await query(
    `SELECT p.full_name, c.headline
     FROM plugin_directory.cards c
     JOIN network_core.memberships m ON m.id = c.membership_id
     JOIN person_core.profiles p ON p.user_id = m.user_id
     WHERE m.community_id = $1 AND c.public_showcase = true`,
    [communityId]
  );
  return NextResponse.json({ data: result.rows });
}
