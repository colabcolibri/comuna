import { query } from '@community/db';
import { showcaseContribution } from '@community/showcase';
import { toPersonCard } from '@/lib/people/person-card';
import { moduleRuntime } from '@/lib/server/membership';

const PUBLIC_SELECT = `
  SELECT m.id, p.full_name, p.avatar_url, p.current_city, p.languages, p.contacts,
         c.headline, c.bio, c.availability_status, c.custom_attributes
  FROM plugin_directory.cards c
  JOIN network_core.memberships m ON m.id = c.membership_id
  JOIN person_core.profiles p ON p.user_id = m.user_id
  WHERE m.community_id = $1 AND c.public_showcase = true
  ORDER BY p.full_name
`;

export async function listPublicProfiles() {
  const community = await query<{ id: string }>(
    `SELECT id FROM network_core.communities WHERE is_public_showcase = true ORDER BY created_at LIMIT 1`
  );
  const communityId = community.rows[0]?.id;
  if (!communityId) {
    return { status: 200 as const, data: [] };
  }
  const on = await moduleRuntime.isEnabled(communityId, showcaseContribution.slug);
  if (!on) {
    return { status: 404 as const, data: [] };
  }
  const result = await query(PUBLIC_SELECT, [communityId]);
  return {
    status: 200 as const,
    data: result.rows.map((row) => toPersonCard(row as Record<string, unknown>)),
  };
}
