import { NextResponse } from 'next/server';
import { listPublicCommunities } from '@community/communities';

export async function GET() {
  const data = await listPublicCommunities();
  return NextResponse.json({
    data: data.map((row) => ({ id: row.id, slug: row.slug, name: row.name })),
  });
}
