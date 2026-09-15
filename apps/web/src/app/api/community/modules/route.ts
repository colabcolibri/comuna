import { NextRequest, NextResponse } from 'next/server';
import { memberFromRequest } from '@community/auth';
import { viewerEnabledSlugs } from '@/lib/server/membership';

export async function GET(req: NextRequest) {
  const member = await memberFromRequest(req);
  const enabled = await viewerEnabledSlugs(member?.sub ?? null);
  return NextResponse.json({ enabled });
}
