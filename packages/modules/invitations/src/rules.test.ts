import { describe, expect, it } from 'vitest';
import {
  canSendInvite,
  DEFAULT_INVITE_LIMIT_PER_MEMBER,
  invitationsContribution,
  inviteLimitFromSettings,
  parseInviteInput,
} from './index';

describe('invitations module', () => {
  it('registers sidebar chrome on /invites', () => {
    expect(invitationsContribution.slug).toBe('invitations');
    expect(invitationsContribution.chrome[0]?.href).toBe('/invites');
  });

  it('resolves per-member invite limit from community settings with safe default', () => {
    expect(inviteLimitFromSettings(null)).toBe(DEFAULT_INVITE_LIMIT_PER_MEMBER);
    expect(inviteLimitFromSettings({ invite_limit_per_member: 3 })).toBe(3);
    expect(inviteLimitFromSettings({ invite_limit_per_member: 500 })).toBe(100);
  });

  it('enforces invite quota for regular members while allowing coordinators', () => {
    expect(canSendInvite({ isCoordinator: false, sentCount: 4, limit: 5 })).toEqual({ allowed: true });
    expect(canSendInvite({ isCoordinator: false, sentCount: 5, limit: 5 })).toEqual({
      allowed: false,
      reason: 'limit_reached',
    });
    expect(canSendInvite({ isCoordinator: true, sentCount: 50, limit: 5 })).toEqual({ allowed: true });
  });

  it('validates email and locale', () => {
    expect(parseInviteInput({ email: ' Ada@Example.com ', locale: 'en' })).toEqual({
      ok: true,
      email: 'ada@example.com',
      locale: 'en',
    });
    expect(parseInviteInput({ email: 'invalid' }).ok).toBe(false);
  });
});
