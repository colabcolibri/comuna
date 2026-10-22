import { NextRequest, NextResponse } from 'next/server';
import { queryAsMember } from '@community/db';
import { parseLocalized } from '@community/identity';
import {
  COMMUNITY_COPY_LIMITS,
  audienceAllowedByCeiling,
  localizedOverLimit,
  communityAllowsShowcaseListing,
  communityListingExposureCap,
  memberListingHints,
  missingRequiredFields,
  parseAudience,
  parseField,
  validateCustomAttributes,
} from '@community/directory';
import { directoryContribution } from '@community/directory';
import { showcaseContribution } from '@community/showcase';
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
        `SELECT headline, bio, headline_audience, bio_audience, availability_audience, attribute_audience, custom_attributes, public_showcase
         FROM plugin_directory.cards WHERE membership_id = $1`,
        [resolved.seat.membership_id]
      )
    : { rows: [] };
  const catalog = on
    ? await queryAsMember(
        { userId: resolved.userId, communityId: resolved.seat.id },
        `SELECT f.name, f.type, f.options, f.storage, f.column_key, f.required, f.localized, f.span, f.sort_order, f.label, f.exposure
         FROM plugin_directory.fields f
         JOIN plugin_directory.field_groups g ON g.id = f.group_id
         WHERE g.community_id = $1 AND g.enabled AND f.enabled`,
        [resolved.seat.id]
      )
    : { rows: [] };
  const fields = catalog.rows
    .map((row) => parseField(row as Record<string, unknown>))
    .filter((field): field is NonNullable<typeof field> => Boolean(field));
  const directoryOn = enabled.includes(directoryContribution.slug);
  const showcaseOn = enabled.includes(showcaseContribution.slug);
  const listing = memberListingHints({
    directoryOn,
    showcaseOn,
    card: card.rows[0] ?? null,
    fields,
  });
  const listingExposureCap = communityListingExposureCap(fields);
  const showcaseListingAllowed = communityAllowsShowcaseListing(fields);
  const membership = await queryAsMember<{ cohort_id: string | null }>(
    { userId: resolved.userId, communityId: resolved.seat.id },
    `SELECT cohort_id FROM network_core.memberships WHERE id = $1`,
    [resolved.seat.membership_id]
  );
  return NextResponse.json({
    membership: {
      id: resolved.seat.membership_id,
      community_id: resolved.seat.id,
      cohort_id: membership.rows[0]?.cohort_id ?? null,
    },
    card: card.rows[0] ?? null,
    listing,
    modules: { showcase: showcaseOn },
    listing_policy: {
      exposure_cap: listingExposureCap,
      showcase_allowed: showcaseOn && showcaseListingAllowed,
    },
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
  if ('public_directory' in body) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Use audiências em vez do opt-in antigo do diretório.' } },
      { status: 400 }
    );
  }
  const publicShowcaseRaw = typeof body.public_showcase === 'boolean' ? body.public_showcase : undefined;
  const communityId = body.community_id;
  if (communityId && communityId !== resolved.seat.id) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'Membership de outra comunidade' } },
      { status: 403 }
    );
  }
  const headline = parseLocalized(body.headline);
  const bio = parseLocalized(body.bio);
  if (localizedOverLimit(headline, COMMUNITY_COPY_LIMITS.headline) || localizedOverLimit(bio, COMMUNITY_COPY_LIMITS.bio)) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Título até 100 caracteres. Apresentação até 600.' } },
      { status: 400 }
    );
  }
  const catalog = await queryAsMember(
    { userId: resolved.userId, communityId: resolved.seat.id },
    `SELECT f.name, f.type, f.options, f.storage, f.column_key, f.required, f.localized, f.span, f.sort_order, f.label, f.exposure
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
  const audiences = body.audiences && typeof body.audiences === 'object' ? (body.audiences as Record<string, unknown>) : {};
  const attributeAudience =
    audiences.attributes && typeof audiences.attributes === 'object' ? (audiences.attributes as Record<string, unknown>) : {};
  const above = fields.some((field) => {
    const chosen =
      field.column_key === 'headline'
        ? audiences.headline
        : field.column_key === 'bio'
          ? audiences.bio
          : field.storage === 'attributes'
            ? attributeAudience[field.name]
            : undefined;
    if (chosen === undefined) return false;
    return !audienceAllowedByCeiling(parseAudience(chosen), field.exposure);
  });
  if (above) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Audiência acima do teto da comunidade.' } },
      { status: 400 }
    );
  }
  const showcaseListingAllowed = communityAllowsShowcaseListing(fields);
  const publicShowcase =
    typeof publicShowcaseRaw === 'boolean'
      ? showcaseListingAllowed && publicShowcaseRaw
      : undefined;

  const values: Record<string, unknown> = {
    headline,
    bio,
    ...attributes.value,
  };
  const cohortWrite = parseCohortWrite(body, fields);
  if (cohortWrite.ok === false) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: cohortWrite.message } }, { status: 400 });
  }
  const cohortField = fields.find((field) => field.column_key === 'cohort_id');
  if (cohortField && cohortWrite.cohortId !== undefined) {
    values[cohortField.name] = cohortWrite.cohortId || '';
  }
  const requiredFields = fields.filter(
    (field) => field.storage !== 'person' && !(field.column_key === 'cohort_id' && cohortWrite.cohortId === undefined)
  );
  if (missingRequiredFields(requiredFields, values).length) {
    return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Preencha os campos obrigatórios.' } }, { status: 400 });
  }
  await queryAsMember(
    { userId: resolved.userId, communityId: resolved.seat.id },
    `INSERT INTO plugin_directory.cards (
       membership_id, headline, bio, headline_audience, bio_audience, availability_audience, attribute_audience, custom_attributes, public_showcase
     ) VALUES ($1, $2::jsonb, $3::jsonb, $4, $5, $6, $7::jsonb, $8::jsonb, coalesce($9, false))
     ON CONFLICT (membership_id) DO UPDATE SET
       headline = EXCLUDED.headline,
       bio = EXCLUDED.bio,
       headline_audience = EXCLUDED.headline_audience,
       bio_audience = EXCLUDED.bio_audience,
       availability_audience = EXCLUDED.availability_audience,
       attribute_audience = EXCLUDED.attribute_audience,
       custom_attributes = EXCLUDED.custom_attributes,
       public_showcase = coalesce($9, plugin_directory.cards.public_showcase)`,
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
      publicShowcase ?? null,
    ]
  );
  if (cohortWrite.cohortId !== undefined) {
    const saved = await queryAsMember(
      { userId: resolved.userId, communityId: resolved.seat.id },
      `UPDATE network_core.memberships m
       SET cohort_id = $2
       WHERE m.id = $1
         AND (
           $2::uuid IS NULL
           OR EXISTS (
             SELECT 1 FROM network_core.cohorts c
             WHERE c.id = $2 AND c.community_id = m.community_id
           )
         )
       RETURNING m.id`,
      [resolved.seat.membership_id, cohortWrite.cohortId]
    );
    if (!saved.rows[0]) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Turma inválida nesta comunidade.' } },
        { status: 400 }
      );
    }
  }
  return NextResponse.json({ ok: true, membership_id: resolved.seat.membership_id });
}

const COHORT_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parseCohortWrite(
  body: { cohort_id?: unknown },
  fields: { column_key: string | null }[]
): { ok: true; cohortId: string | null | undefined } | { ok: false; message: string } {
  if (!Object.prototype.hasOwnProperty.call(body, 'cohort_id')) {
    return { ok: true, cohortId: undefined };
  }
  if (!fields.some((field) => field.column_key === 'cohort_id')) {
    return { ok: false, message: 'Esta comunidade não pede turma no perfil.' };
  }
  const raw = typeof body.cohort_id === 'string' ? body.cohort_id.trim() : '';
  if (!raw) {
    return { ok: true, cohortId: null };
  }
  if (!COHORT_UUID.test(raw)) {
    return { ok: false, message: 'Turma inválida nesta comunidade.' };
  }
  return { ok: true, cohortId: raw };
}
