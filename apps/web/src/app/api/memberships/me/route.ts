import { NextRequest, NextResponse } from 'next/server';
import { queryAsMember } from '@community/db';
import { parseLocalized } from '@community/identity';
import { missingRequiredFields, parseAudience, parseField, validateCustomAttributes } from '@community/directory';
import { canWriteCards } from '@/modules/registry';
import { moduleRuntime } from '@/lib/server/membership';
import { memberCommunityFromRequest } from '@/lib/server/member-community';

export async function GET(req: NextRequest) {
  const resolved = await memberCommunityFromRequest(req);
  if (!resolved.ok) {
    return resolved.response;
  }
  const enabled = await moduleRuntime.listEnabled(resolved.seat.id);
  const on = canWriteCards(enabled);
  const card = on
    ? await queryAsMember(
        { userId: resolved.userId, communityId: resolved.seat.id },
        `SELECT headline, bio, headline_audience, bio_audience, availability_audience, attribute_audience, custom_attributes
         FROM plugin_directory.cards WHERE membership_id = $1`,
        [resolved.seat.membership_id]
      )
    : { rows: [] };
  return NextResponse.json({
    membership: { id: resolved.seat.membership_id, community_id: resolved.seat.id },
    card: card.rows[0] ?? null,
  });
}

export async function PUT(req: NextRequest) {
  const resolved = await memberCommunityFromRequest(req);
  if (!resolved.ok) {
    return resolved.response;
  }
  const enabled = await moduleRuntime.listEnabled(resolved.seat.id);
  if (!canWriteCards(enabled)) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Módulo desligado' } }, { status: 404 });
  }
  const body = await req.json();
  if ('public_directory' in body || 'public_showcase' in body) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Use audiences em vez dos opt-ins antigos.' } },
      { status: 400 }
    );
  }
  const communityId = body.community_id;
  if (communityId && communityId !== resolved.seat.id) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'Membership de outra comunidade' } },
      { status: 403 }
    );
  }
  const headline = parseLocalized(body.headline);
  const bio = parseLocalized(body.bio);
  const catalog = await queryAsMember(
    { userId: resolved.userId, communityId: resolved.seat.id },
    `SELECT f.name, f.type, f.options, f.storage, f.column_key, f.required, f.localized, f.span, f.sort_order, f.label
     FROM plugin_directory.fields f
     JOIN plugin_directory.field_groups g ON g.id = f.group_id
     WHERE g.community_id = $1 AND g.enabled AND f.enabled`,
    [resolved.seat.id]
  );
  const fields = catalog.rows
    .map((row) => parseField(row as Record<string, unknown>))
    .filter((field): field is NonNullable<typeof field> => Boolean(field));
  const attributes = validateCustomAttributes(fields, body.custom_attributes);
  if (attributes.ok === false) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: attributes.message } }, { status: 400 });
  }
  const audiences = body.audiences && typeof body.audiences === 'object' ? body.audiences : {};
  const attributeAudience =
    audiences.attributes && typeof audiences.attributes === 'object' ? audiences.attributes : {};
  const values: Record<string, unknown> = {
    headline,
    bio,
    ...attributes.value,
  };
  if (missingRequiredFields(fields.filter((field) => field.storage !== 'person'), values).length) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Preencha os campos obrigatórios.' } }, { status: 400 });
  }
  await queryAsMember(
    { userId: resolved.userId, communityId: resolved.seat.id },
    `INSERT INTO plugin_directory.cards (
       membership_id, headline, bio, headline_audience, bio_audience, availability_audience, attribute_audience, custom_attributes
     ) VALUES ($1, $2::jsonb, $3::jsonb, $4, $5, $6, $7::jsonb, $8::jsonb)
     ON CONFLICT (membership_id) DO UPDATE SET
       headline = EXCLUDED.headline,
       bio = EXCLUDED.bio,
       headline_audience = EXCLUDED.headline_audience,
       bio_audience = EXCLUDED.bio_audience,
       availability_audience = EXCLUDED.availability_audience,
       attribute_audience = EXCLUDED.attribute_audience,
       custom_attributes = EXCLUDED.custom_attributes`,
    [
      resolved.seat.membership_id,
      JSON.stringify(headline),
      JSON.stringify(bio),
      parseAudience(audiences.headline),
      parseAudience(audiences.bio),
      parseAudience(audiences.availability),
      JSON.stringify(
        Object.fromEntries(
          Object.entries(attributeAudience as Record<string, unknown>).map(([key, value]) => [key, parseAudience(value)])
        )
      ),
      JSON.stringify(attributes.value),
    ]
  );
  return NextResponse.json({ ok: true, membership_id: resolved.seat.membership_id });
}
