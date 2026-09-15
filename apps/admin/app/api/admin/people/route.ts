import { NextRequest, NextResponse } from 'next/server';
import { DuplicateEmailError, InvalidEmailError, createNetworkPerson } from '@community/auth';
import { sendKindEmail } from '@community/mail';
import { OPS_LIST_LIMIT, listNetworkPeople } from '@community/memberships';
import { isOpsClaims, requireOps } from '@/lib/require-ops';
import { jsonError } from '@/lib/http';

export async function GET(req: NextRequest) {
  const ops = await requireOps(req);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const q = req.nextUrl.searchParams.get('q') || '';
  const offset = Math.max(0, Number(req.nextUrl.searchParams.get('offset') || '0') || 0);
  const data = await listNetworkPeople({ q, offset });
  return NextResponse.json({ data, meta: { hasMore: data.length === OPS_LIST_LIMIT } });
}

export async function POST(req: NextRequest) {
  const ops = await requireOps(req);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const body = await req.json();
  const email = typeof body.email === 'string' ? body.email : '';
  const full_name = typeof body.full_name === 'string' ? body.full_name : '';
  try {
    const person = await createNetworkPerson(email, full_name);
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3014'}/login`;
    await sendKindEmail({
      kind: 'person_invite',
      to: person.email,
      locale: 'pt-BR',
      vars: { login_url: loginUrl },
    });
    return NextResponse.json({ id: person.id, email: person.email, full_name: person.full_name }, { status: 201 });
  } catch (err) {
    if (err instanceof DuplicateEmailError) {
      return jsonError('DUPLICATE_EMAIL', 'E-mail já existe', 409);
    }
    if (err instanceof InvalidEmailError) {
      return jsonError('VALIDATION_ERROR', 'E-mail ou nome inválido', 400);
    }
    throw err;
  }
}
