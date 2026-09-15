import { NextRequest, NextResponse } from 'next/server';
import { query } from '@community/db';
import { sendKindEmail } from '@community/mail';
import { contactMediatedContribution, parseContactPayload } from '@community/contact-mediated';
import { moduleRuntime } from '@/lib/server/membership';

export async function POST(req: NextRequest, ctx: { params: Promise<{ membershipId: string }> }) {
  const { membershipId } = await ctx.params;
  const membership = await query<{ community_id: string; user_id: string }>(
    `SELECT community_id, user_id FROM network_core.memberships WHERE id = $1`,
    [membershipId]
  );
  const row = membership.rows[0];
  if (!row) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Perfil não encontrado' } }, { status: 404 });
  }
  const on = await moduleRuntime.isEnabled(row.community_id, contactMediatedContribution.slug);
  if (!on) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Módulo desligado' } }, { status: 404 });
  }
  const body = await req.json();
  const parsed = parseContactPayload(body);
  if (!parsed.ok) {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message:
            parsed.reason === 'message_min'
              ? 'A mensagem precisa ter pelo menos 40 caracteres.'
              : 'Preencha nome, e-mail e mensagem.',
        },
      },
      { status: 400 }
    );
  }
  const { senderName, senderEmail, senderPhone, message } = parsed.value;
  const target = await query<{ email: string }>(`SELECT email FROM auth_core.users WHERE id = $1`, [row.user_id]);
  const to = target.rows[0]?.email;
  if (!to) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Perfil não encontrado' } }, { status: 404 });
  }
  const community = await query<{ name: string; settings: unknown }>(
    `SELECT name, settings FROM network_core.communities WHERE id = $1`,
    [row.community_id]
  );
  const settings = community.rows[0]?.settings as { default_locale?: string } | undefined;
  const locale = settings?.default_locale === 'en' ? 'en' : 'pt-BR';
  await sendKindEmail({
    kind: 'contact_notice',
    to,
    locale,
    vars: {
      community_name: community.rows[0]?.name || '',
      sender_name: senderName,
      sender_email: senderEmail,
      sender_phone: senderPhone,
      message,
    },
  });
  return NextResponse.json({ message: 'Mensagem enviada com sucesso' });
}
