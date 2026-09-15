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

export async function listPublicProfiles(communityId: string) {
  const on = await moduleRuntime.isEnabled(communityId, showcaseContribution.slug);
  if (!on) {
    return { status: 404 as const, data: [] };
  }
  const catalog = await query<{ name: string }>(
    `SELECT f.name
     FROM plugin_directory.fields f
     JOIN plugin_directory.field_groups g ON g.id = f.group_id
     WHERE g.community_id = $1 AND f.storage = 'attributes' AND f.filterable = true`,
    [communityId]
  );
  const attributeKeys = catalog.rows.map((row) => row.name);
  const result = await query(PUBLIC_SELECT, [communityId]);
  return {
    status: 200 as const,
    data: result.rows.map((row) => toPersonCard(row as Record<string, unknown>, attributeKeys)),
  };
}
