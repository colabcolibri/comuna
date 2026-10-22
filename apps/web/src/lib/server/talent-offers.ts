import { query, queryAsMember } from '@community/db';
import type { AppQueryCtx } from '@/lib/server/app-ctx';

const SQL = `SELECT membership_id, title, description, url, category_id, category_other, audience, featured_on_card
  FROM plugin_talent.offerings
  WHERE membership_id = ANY($1::uuid[]) AND audience = ANY($2::text[])
  ORDER BY featured_on_card DESC, created_at ASC, id ASC`;

export async function offeringsByMembership(
  rows: Record<string, unknown>[],
  level: 'internal' | 'external',
  load: (sql: string, params: unknown[]) => Promise<{ rows: Record<string, unknown>[] }>,
  ceiling: 'hidden' | 'internal' | 'external' = 'external'
) {
  if (!rows.length || ceiling === 'hidden' || (ceiling === 'internal' && level === 'external')) {
    return rows;
  }
  const ids = rows.map((row) => String(row.id));
  const audiences = level === 'external' ? ['external'] : ['internal', 'external'];
  const found = await load(SQL, [ids, audiences]);
  const grouped = new Map<string, Record<string, unknown>[]>();
  for (const offer of found.rows) {
    const key = String(offer.membership_id);
    const list = grouped.get(key) || [];
    list.push(offer);
    grouped.set(key, list);
  }
  return rows.map((row) => {
    const offerings = grouped.get(String(row.id)) || [];
    return offerings.length ? { ...row, offerings } : row;
  });
}

export function loadOfferingsAsMember(ctx: AppQueryCtx) {
  return (sql: string, params: unknown[]) => queryAsMember(ctx, sql, params);
}

export function loadOfferingsPublic() {
  return (sql: string, params: unknown[]) => query(sql, params);
}
