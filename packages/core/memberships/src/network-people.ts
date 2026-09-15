import { queryAsOps } from '@community/db';

export type NetworkPersonSeat = {
  community_id: string;
  community_name: string;
  community_slug: string;
  network_role: string;
  network_status: string;
};

export type NetworkPerson = {
  id: string;
  email: string;
  full_name: string;
  global_role: string;
  seats: NetworkPersonSeat[];
};

function parseSeats(raw: unknown): NetworkPersonSeat[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const seats: NetworkPersonSeat[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') {
      continue;
    }
    const row = item as Record<string, unknown>;
    const communityId = String(row.community_id || '');
    if (!communityId) {
      continue;
    }
    seats.push({
      community_id: communityId,
      community_name: String(row.community_name || ''),
      community_slug: String(row.community_slug || ''),
      network_role: String(row.network_role || 'member'),
      network_status: String(row.network_status || ''),
    });
  }
  return seats;
}

export async function listNetworkPeople(): Promise<NetworkPerson[]> {
  const result = await queryAsOps<{
    id: string;
    email: string;
    full_name: string;
    global_role: string;
    seats: unknown;
  }>(
    `SELECT u.id, u.email, u.global_role,
            coalesce(nullif(p.full_name, ''), u.email) AS full_name,
            coalesce(
              json_agg(
                json_build_object(
                  'community_id', c.id,
                  'community_name', c.name,
                  'community_slug', c.slug,
                  'network_role', m.network_role,
                  'network_status', m.network_status
                )
                ORDER BY c.name
              ) FILTER (WHERE m.id IS NOT NULL),
              '[]'::json
            ) AS seats
     FROM auth_core.users u
     LEFT JOIN person_core.profiles p ON p.user_id = u.id
     LEFT JOIN network_core.memberships m ON m.user_id = u.id
     LEFT JOIN network_core.communities c ON c.id = m.community_id
     GROUP BY u.id, u.email, u.global_role, p.full_name
     ORDER BY 3, u.email`
  );
  return result.rows.map((row) => ({
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    global_role: row.global_role,
    seats: parseSeats(row.seats),
  }));
}
