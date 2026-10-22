import { NextRequest, NextResponse } from 'next/server';
import { queryAsMember } from '@community/db';
import { OFFERING_LIMIT, parseOffering, talentCeiling, talentContribution } from '@community/talent';
import { memberCommunityFromRequest } from '@/lib/server/member-community';
import { moduleRuntime } from '@/lib/server/membership';
import { memberTalentCategories, offeringCategoryRules } from '@/lib/server/talent-categories';

async function gate(req: NextRequest) {
  const resolved = await memberCommunityFromRequest(req);
  if (!resolved.ok) {
    return { ok: false as const, response: resolved.response };
  }
  const on = await moduleRuntime.isEnabled(resolved.seat.id, talentContribution.slug);
  if (!on) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Módulo desligado' } }, { status: 404 }),
    };
  }
  return { ok: true as const, resolved };
}

export async function GET(req: NextRequest) {
  const gated = await gate(req);
  if (!gated.ok) {
    return gated.response;
  }
  const { resolved } = gated;
  const ctx = { userId: resolved.userId, communityId: resolved.seat.id };
  const categories = await memberTalentCategories(ctx, { enabledOnly: true });
  const rows = await queryAsMember(
    { userId: resolved.userId, communityId: resolved.seat.id },
    `SELECT id, title, description, url, category_id, category_other, audience, featured_on_card
     FROM plugin_talent.offerings
     WHERE membership_id = $1
     ORDER BY featured_on_card DESC, created_at ASC, id ASC`,
    [resolved.seat.membership_id]
  );
  const settings = await queryAsMember<{ settings: unknown }>(
    { userId: resolved.userId, communityId: resolved.seat.id },
    `SELECT settings FROM network_core.communities WHERE id = $1`,
    [resolved.seat.id]
  );
  return NextResponse.json({
    data: rows.rows,
    ceiling: talentCeiling(settings.rows[0]?.settings),
    categories: categories.map((item) => ({
      id: item.id,
      label: item.label,
      allowsOtherText: item.allowsOtherText,
    })),
  });
}

export async function POST(req: NextRequest) {
  const gated = await gate(req);
  if (!gated.ok) {
    return gated.response;
  }
  const { resolved } = gated;
  const ctx = { userId: resolved.userId, communityId: resolved.seat.id };
  const categoryRules = offeringCategoryRules(await memberTalentCategories(ctx));
  const parsed = parseOffering(await req.json(), categoryRules);
  if (!parsed.ok) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: parsed.message } }, { status: 400 });
  }
  const count = await queryAsMember<{ total: number }>(
    { userId: resolved.userId, communityId: resolved.seat.id },
    `SELECT count(*)::int AS total FROM plugin_talent.offerings WHERE membership_id = $1`,
    [resolved.seat.membership_id]
  );
  if ((count.rows[0]?.total ?? 0) >= OFFERING_LIMIT) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Limite de ofertas atingido.' } }, { status: 400 });
  }
  const settings = await queryAsMember<{ settings: unknown }>(
    { userId: resolved.userId, communityId: resolved.seat.id },
    `SELECT settings FROM network_core.communities WHERE id = $1`,
    [resolved.seat.id]
  );
  const ceiling = talentCeiling(settings.rows[0]?.settings);
  if (ceiling === 'internal' && parsed.value.audience === 'external') {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Audiência acima do teto da comunidade.' } },
      { status: 400 }
    );
  }
  const value = parsed.value;
  const featuredDefault =
    (count.rows[0]?.total ?? 0) === 0
      ? true
      : false;
  const inserted = await queryAsMember(
    { userId: resolved.userId, communityId: resolved.seat.id },
    `INSERT INTO plugin_talent.offerings
       (membership_id, community_id, title, description, url, category_id, category_other, audience, featured_on_card)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id`,
    [
      resolved.seat.membership_id,
      resolved.seat.id,
      value.title,
      value.description,
      value.url,
      value.categoryId,
      value.categoryOther,
      value.audience,
      featuredDefault,
    ]
  );
  return NextResponse.json({ id: inserted.rows[0]?.id }, { status: 201 });
}
