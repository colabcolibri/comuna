import crypto from 'node:crypto';
import { isSmtpConfigured } from '@community/auth/smtp';
import { queryAsMember } from '@community/db';
import { canSendInvite, inviteLimitFromSettings } from '@community/invitations';
import { sendKindEmail } from '@community/mail';
import type { AppQueryCtx } from '@/lib/server/app-ctx';

export type InvitationRecord = {
  id: string;
  email: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
};

export async function listCommunityInvitations(
  ctx: AppQueryCtx,
  opts: { scope: 'all' | 'mine' }
): Promise<{ invitations: InvitationRecord[]; limit: number; sentCount: number }> {
  const settingsRes = await queryAsMember<{ settings: unknown }>(
    ctx,
    `SELECT settings FROM network_core.communities WHERE id = $1`,
    [ctx.communityId]
  );
  const limit = inviteLimitFromSettings(settingsRes.rows[0]?.settings);

  const listSql =
    opts.scope === 'all'
      ? `SELECT id, email, token, expires_at, accepted_at, created_at
         FROM network_core.invitations
         WHERE community_id = $1
         ORDER BY created_at DESC
         LIMIT 50`
      : `SELECT id, email, token, expires_at, accepted_at, created_at
         FROM network_core.invitations
         WHERE community_id = $1 AND invited_by = $2
         ORDER BY created_at DESC
         LIMIT 50`;

  const listParams = opts.scope === 'all' ? [ctx.communityId] : [ctx.communityId, ctx.userId];
  const res = await queryAsMember<InvitationRecord>(ctx, listSql, listParams);

  const countRes = await queryAsMember<{ total: number }>(
    ctx,
    `SELECT count(*)::int AS total
     FROM network_core.invitations
     WHERE community_id = $1 AND invited_by = $2`,
    [ctx.communityId, ctx.userId]
  );

  return {
    invitations: res.rows,
    limit,
    sentCount: countRes.rows[0]?.total ?? 0,
  };
}

export async function createCommunityInvitation(
  ctx: AppQueryCtx,
  input: {
    communityName: string;
    email: string;
    locale: 'pt-BR' | 'en';
    origin: string;
    isCoordinator: boolean;
  }
): Promise<
  | { ok: true; invitation: InvitationRecord; inviteUrl: string; emailSent: boolean }
  | { ok: false; status: 403; message: string }
> {
  const settingsRes = await queryAsMember<{ settings: unknown }>(
    ctx,
    `SELECT settings FROM network_core.communities WHERE id = $1`,
    [ctx.communityId]
  );
  const limit = inviteLimitFromSettings(settingsRes.rows[0]?.settings);

  const countRes = await queryAsMember<{ total: number }>(
    ctx,
    `SELECT count(*)::int AS total
     FROM network_core.invitations
     WHERE community_id = $1 AND invited_by = $2`,
    [ctx.communityId, ctx.userId]
  );
  const sentCount = countRes.rows[0]?.total ?? 0;

  const check = canSendInvite({ isCoordinator: input.isCoordinator, sentCount, limit });
  if (check.allowed === false) {
    return {
      ok: false,
      status: 403,
      message: `Limite de ${limit} convites atingido para sua conta.`,
    };
  }

  const token = crypto.randomBytes(24).toString('hex');
  const inserted = await queryAsMember<InvitationRecord>(
    ctx,
    `INSERT INTO network_core.invitations (community_id, email, token, invited_by)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, token, expires_at, accepted_at, created_at`,
    [ctx.communityId, input.email, token, ctx.userId]
  );

  const invitation = inserted.rows[0];
  const inviteUrl = `${input.origin}/invite/${token}`;

  let emailSent = false;
  if (isSmtpConfigured()) {
    try {
      await sendKindEmail({
        kind: 'community_invite',
        to: input.email,
        locale: input.locale,
        vars: {
          community_name: input.communityName || 'Comunidade',
          login_url: inviteUrl,
        },
      });
      emailSent = true;
    } catch {
      emailSent = false;
    }
  }

  return { ok: true, invitation, inviteUrl, emailSent };
}

export async function revokeCommunityInvitation(
  ctx: AppQueryCtx,
  input: { id: string; scope: 'all' | 'mine' }
) {
  if (input.scope === 'all') {
    await queryAsMember(
      ctx,
      `DELETE FROM network_core.invitations WHERE id = $1 AND community_id = $2`,
      [input.id, ctx.communityId]
    );
    return;
  }
  await queryAsMember(
    ctx,
    `DELETE FROM network_core.invitations
     WHERE id = $1 AND community_id = $2 AND invited_by = $3 AND accepted_at IS NULL`,
    [input.id, ctx.communityId, ctx.userId]
  );
}
