export const DEFAULT_INVITE_LIMIT_PER_MEMBER = 5;

export function inviteLimitFromSettings(settings: unknown): number {
  if (!settings || typeof settings !== 'object') {
    return DEFAULT_INVITE_LIMIT_PER_MEMBER;
  }
  const raw = Number((settings as Record<string, unknown>).invite_limit_per_member);
  if (!Number.isFinite(raw) || raw < 1) {
    return DEFAULT_INVITE_LIMIT_PER_MEMBER;
  }
  return Math.min(100, Math.floor(raw));
}

export function canSendInvite(input: {
  isCoordinator: boolean;
  sentCount: number;
  limit: number;
}): { allowed: true } | { allowed: false; reason: 'limit_reached' } {
  if (input.isCoordinator) {
    return { allowed: true };
  }
  if (input.sentCount >= input.limit) {
    return { allowed: false, reason: 'limit_reached' };
  }
  return { allowed: true };
}

export function parseInviteInput(body: { email?: unknown; locale?: unknown }):
  | { ok: true; email: string; locale: 'pt-BR' | 'en' }
  | { ok: false; message: string } {
  const email = String(body.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: 'E-mail inválido.' };
  }
  const locale = body.locale === 'en' ? 'en' : 'pt-BR';
  return { ok: true, email, locale };
}
