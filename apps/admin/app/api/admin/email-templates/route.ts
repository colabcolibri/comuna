import { NextRequest, NextResponse } from 'next/server';
import { MailValidationError, listEmailTemplates } from '@community/mail';
import { jsonError } from '@/lib/http';
import { requireSuperOps } from '@/lib/require-ops';

export async function GET(req: NextRequest) {
  const claims = await requireSuperOps(req);
  if (claims instanceof NextResponse) {
    return claims;
  }
  const kind = req.nextUrl.searchParams.get('kind') || 'member_otp';
  const locale = req.nextUrl.searchParams.get('locale') || 'pt-BR';
  try {
    const data = await listEmailTemplates(kind, locale);
    return NextResponse.json({ data });
  } catch (err) {
    if (err instanceof MailValidationError) {
      return jsonError('VALIDATION_ERROR', 'Kind ou locale inválido', 400);
    }
    throw err;
  }
}
