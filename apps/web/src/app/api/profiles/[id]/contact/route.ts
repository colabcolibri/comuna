import { NextRequest, NextResponse } from 'next/server';
import { query } from '@community/db';
import { sendSmtpMail } from '@community/auth';
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
  const on = await moduleRuntime.isEnabled(row.community_id, 'contact-mediated');
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
  const senderEmail = String(body.sender_email || '');
  const senderName = String(body.sender_name || '');
  const message = String(body.message || '');
  if (!senderEmail.includes('@') || !message) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Campos obrigatórios' } },
      { status: 400 }
    );
  }
  await query(
    `INSERT INTO plugin_contact.messages (membership_id, sender_email, sender_name, body)
     VALUES ($1, $2, $3, $4)`,
    [id, senderEmail, senderName, message]
  );
  const target = await query<{ email: string }>(`SELECT email FROM auth_core.users WHERE id = $1`, [row.user_id]);
  const to = target.rows[0]?.email;
  if (!to) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Perfil não encontrado' } }, { status: 404 });
  }
  const host = process.env.SMTP_HOST;
  if (host) {
    await sendSmtpMail({
      host,
      port: Number(process.env.SMTP_PORT || '1026'),
      from: process.env.EMAIL_FROM_ADDRESS || 'auth@community.local',
      to,
      subject: 'Contato mediado',
      text: `${senderName} <${senderEmail}>\n\n${message}`,
    });
  }
  return NextResponse.json({ message: 'Mensagem enviada com sucesso' });
}
