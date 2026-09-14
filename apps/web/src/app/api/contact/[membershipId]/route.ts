import { NextRequest, NextResponse } from 'next/server';
import { query } from '@community/db';
import { sendSmtpMail } from '@community/auth';
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
  const on = await moduleRuntime.isEnabled(row.community_id, 'contact-mediated');
  if (!on) {
    return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Módulo desligado' } }, { status: 404 });
  }
  const body = await req.json();
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
      text: `${body.sender_name} <${body.sender_email}>\n\n${body.message}`,
    });
  }
  return NextResponse.json({ message: 'Mensagem enviada com sucesso' });
}
