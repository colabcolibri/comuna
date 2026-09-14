import { NextRequest, NextResponse } from 'next/server';
import { memberFromRequest } from '@community/auth';
import { query } from '@community/db';

async function requireOps(req: NextRequest) {
  const member = await memberFromRequest(req);
  if (!member || member.global_role !== 'super_admin') {
    return null;
  }
  return member;
}

export async function GET(req: NextRequest) {
  const ops = await requireOps(req);
  if (!ops) {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Ops only' } }, { status: 403 });
  }
  const result = await query(`SELECT id, slug, name, type FROM network_core.communities ORDER BY created_at`);
  return NextResponse.json({ data: result.rows });
}

export async function POST(req: NextRequest) {
  const ops = await requireOps(req);
  if (!ops) {
    return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Ops only' } }, { status: 403 });
  }
  const body = await req.json();
  const inserted = await query(
    `INSERT INTO network_core.communities (slug, name, type)
     VALUES ($1, $2, $3)
     RETURNING id, slug, name`,
    [body.slug, body.name, body.type || 'alumni']
  );
  return NextResponse.json(inserted.rows[0], { status: 201 });
}
