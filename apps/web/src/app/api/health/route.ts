import { NextResponse } from 'next/server';
import { healthCheck } from '@community/db';

export async function GET() {
  try {
    const ok = await healthCheck();
    if (!ok) {
      return NextResponse.json({ ok: false }, { status: 503 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
