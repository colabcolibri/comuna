import { NextRequest, NextResponse } from 'next/server';
import { createCommunity, DuplicateCommunitySlugError, listCommunities } from '@community/communities';
import { enableFirstPartyModules } from '@community/module-runtime';
import { seedCommunityCatalog } from '@community/directory/ops';
import { query } from '@community/db';
import { jsonError } from '@/lib/http';
import { isOpsClaims, requireOps } from '@/lib/require-ops';
import { firstPartySlugs } from '@/lib/registry';

export async function GET(req: NextRequest) {
  const ops = await requireOps(req);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const data = await listCommunities();
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const ops = await requireOps(req);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const body = await req.json();
  const slug = typeof body.slug === 'string' ? body.slug : '';
  const name = typeof body.name === 'string' ? body.name : '';
  if (!slug.trim() || !name.trim()) {
    return jsonError('VALIDATION_ERROR', 'slug e name obrigatórios', 400);
  }
  try {
    const community = await createCommunity({ slug, name });
    await enableFirstPartyModules(query, community.id, firstPartySlugs);
    await seedCommunityCatalog(community.id);
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
