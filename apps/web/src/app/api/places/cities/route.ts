import { NextRequest, NextResponse } from 'next/server';
import { memberFromRequest } from '@community/auth';
import { searchCities } from '@community/places';

export async function GET(req: NextRequest) {
  const member = await memberFromRequest(req);
  if (!member) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Sessão inválida' } }, { status: 401 });
  }
  try {
    const data = await searchCities(String(req.nextUrl.searchParams.get('q') || ''));
    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: { code: 'UPSTREAM_UNAVAILABLE', message: 'Busca de cidade indisponível' } },
      { status: 502 }
    );
  }
}
