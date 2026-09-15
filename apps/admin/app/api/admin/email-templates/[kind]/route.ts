import { NextRequest, NextResponse } from 'next/server';
import { MailValidationError, deleteEmailOverlay, isEmailKind, isEmailLocale, upsertEmailOverlay } from '@community/mail';
import { jsonError } from '@/lib/http';
import { isOpsClaims, requireOps } from '@/lib/require-ops';

export async function PUT(req: NextRequest, ctx: { params: Promise<{ kind: string }> }) {
  const ops = await requireOps(req);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const { kind } = await ctx.params;
  if (!isEmailKind(kind)) {
    return jsonError('VALIDATION_ERROR', 'Kind inválido', 400);
  }
  const body = await req.json();
  const locale = typeof body.locale === 'string' ? body.locale : '';
  if (!isEmailLocale(locale)) {
    return jsonError('VALIDATION_ERROR', 'Locale inválido', 400);
  }
  try {
    await upsertEmailOverlay(kind, locale, {
      subject: String(body.subject || ''),
      heading: String(body.heading || ''),
      body: String(body.body || ''),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof MailValidationError) {
      return jsonError('VALIDATION_ERROR', 'Template incompleto', 400);
    }
    throw err;
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ kind: string }> }) {
  const ops = await requireOps(req);
  if (!isOpsClaims(ops)) {
    return ops;
  }
  const { kind } = await ctx.params;
  const locale = req.nextUrl.searchParams.get('locale') || 'pt-BR';
  if (!isEmailKind(kind) || !isEmailLocale(locale)) {
    return jsonError('VALIDATION_ERROR', 'Kind ou locale inválido', 400);
  }
  await deleteEmailOverlay(kind, locale);
  return NextResponse.json({ ok: true });
}
