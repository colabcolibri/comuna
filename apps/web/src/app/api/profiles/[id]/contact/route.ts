import { NextRequest, NextResponse } from 'next/server';
import { query } from '@community/db';
import { sendKindEmail } from '@community/mail';
import { contactMediatedContribution } from '@community/contact-mediated';
import { moduleRuntime } from '@/lib/server/membership';

const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const recent = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  if (recent.length >= 5) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Muitas solicitações' } },
      { status: 429 }
    );
  }
  const { id } = await ctx.params;
  const membership = await query<{ community_id: string; user_id: string }>(
    `SELECT community_id, user_id FROM network_core.memberships WHERE id = $1`,
    [id]
  );
  const row = membership.rows[0];
  if (!row) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Perfil não encontrado' } }, { status: 404 });
  }
  const on = await moduleRuntime.isEnabled(row.community_id, contactMediatedContribution.slug);
  if (!on) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Módulo desligado' } }, { status: 404 });
  }
  const card = await query<{ public_showcase: boolean }>(
    `SELECT public_showcase FROM plugin_directory.cards WHERE membership_id = $1`,
    [id]
  );
  if (!card.rows[0]?.public_showcase) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Perfil não encontrado' } }, { status: 404 });
  }
  const body = await req.json();
  const senderEmail = String(body.sender_email || '').trim();
  const senderName = String(body.sender_name || '').trim();
  const senderPhone = String(body.sender_phone || '').trim().slice(0, 40);
  const message = String(body.message || '').trim();
  if (!senderEmail.includes('@') || !message) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Campos obrigatórios' } },
      { status: 400 }
    );
  }
  await query(
    `INSERT INTO plugin_contact.messages (membership_id, sender_email, sender_name, sender_phone, body)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, senderEmail, senderName || null, senderPhone || null, message]
  );
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
