import { describe, expect, it } from 'vitest';
import { CONTACT_MESSAGE_MIN, parseContactPayload } from './payload';

const longEnough = 'x'.repeat(CONTACT_MESSAGE_MIN);

describe('parseContactPayload', () => {
  it('requires name, a plausible email, and a long enough message', () => {
    expect(parseContactPayload({ sender_email: 'ada@example.com', message: longEnough }).ok).toBe(false);
    expect(parseContactPayload({ sender_name: 'Ada', sender_email: 'ada', message: longEnough }).ok).toBe(false);
    const short = parseContactPayload({
      sender_name: 'Ada',
      sender_email: 'ada@example.com',
      message: 'Oi',
    });
    expect(short.ok).toBe(false);
    if (!short.ok) {
      expect(short.reason).toBe('message_min');
    }
    const parsed = parseContactPayload({
      sender_name: ' Ada ',
      sender_email: 'ada@example.com',
      sender_phone: ' 11999990000 ',
      message: `  ${longEnough}  `,
    });
    expect(parsed).toEqual({
      ok: true,
      value: {
        senderName: 'Ada',
        senderEmail: 'ada@example.com',
        senderPhone: '11999990000',
        message: longEnough,
      },
    });
  });
});
