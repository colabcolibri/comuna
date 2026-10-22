import { NextRequest, NextResponse } from 'next/server';
import { createCommunity, DuplicateCommunitySlugError, listCommunities } from '@community/communities';
import { enableFirstPartyModules, ensureDisabledModule } from '@community/module-runtime';
import { seedCommunityCatalog } from '@community/directory/ops';
import { ensureDefaultTalentCategories } from '@community/talent/ops';
import { query } from '@community/db';
import { jsonError } from '@/lib/http';
import { isOpsClaims, requireOps, requireSuperOps } from '@/lib/require-ops';
import { defaultEnabledSlugs } from '@/lib/registry';

export async function GET(req: NextRequest) {
  const ops = await requireOps(req);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const data = await listCommunities();
  const scoped =
    ops.communityIds === null ? data : data.filter((row) => ops.communityIds!.includes(row.id));
  return NextResponse.json({ data: scoped });
}

export async function POST(req: NextRequest) {
  const claims = await requireSuperOps(req);
  if (claims instanceof NextResponse) {
    return claims;
  }
  const body = await req.json();
  const slug = typeof body.slug === 'string' ? body.slug : '';
  const name = typeof body.name === 'string' ? body.name : '';
  if (!slug.trim() || !name.trim()) {
    return jsonError('VALIDATION_ERROR', 'slug e name obrigatórios', 400);
  }
  try {
    const community = await createCommunity({ slug, name });
    await enableFirstPartyModules(query, community.id, defaultEnabledSlugs);
    await ensureDisabledModule(query, community.id, 'talent');
    await seedCommunityCatalog(community.id);
    await ensureDefaultTalentCategories((sql, params) => query(sql, params), community.id);
    return NextResponse.json(community, { status: 201 });
  } catch (err) {
    if (err instanceof DuplicateCommunitySlugError) {
      return jsonError('VALIDATION_ERROR', 'Slug duplicado', 400);
    }
    if (err instanceof Error && err.message === 'VALIDATION_ERROR') {
      return jsonError('VALIDATION_ERROR', 'slug e name obrigatórios', 400);
    }
    throw err;
  }
}
