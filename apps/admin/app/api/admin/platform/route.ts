import { NextRequest, NextResponse } from 'next/server';
import { describeSmtpTransport } from '@community/auth/smtp';
import { getPlatformSettings, PlatformValidationError, updatePlatformSettings } from '@community/platform';
import { jsonError } from '@/lib/http';
import { requireSuperOps } from '@/lib/require-ops';

export async function GET(req: NextRequest) {
  const claims = await requireSuperOps(req);
  if (claims instanceof NextResponse) {
    return claims;
  }
  const settings = await getPlatformSettings();
  return NextResponse.json({ ...settings, smtp: describeSmtpTransport() });
}

export async function PUT(req: NextRequest) {
  const claims = await requireSuperOps(req);
  if (claims instanceof NextResponse) {
    return claims;
  }
  const body = await req.json();
  try {
    const settings = await updatePlatformSettings(body);
    return NextResponse.json(settings);
  } catch (err) {
    if (err instanceof PlatformValidationError) {
      return jsonError('VALIDATION_ERROR', 'Dados da plataforma inválidos', 400);
    }
    throw err;
  }
}
