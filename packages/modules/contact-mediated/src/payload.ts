export const CONTACT_MESSAGE_MIN = 40;

export type ContactPayload = {
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  message: string;
};

export function parseContactPayload(input: unknown):
  | { ok: true; value: ContactPayload }
  | { ok: false; reason: 'required' | 'message_min' } {
  const raw = input && typeof input === 'object' ? (input as Record<string, unknown>) : {};
  const senderName = String(raw.sender_name || '').trim();
  const senderEmail = String(raw.sender_email || '').trim();
  const senderPhone = String(raw.sender_phone || '').trim().slice(0, 40);
  const message = String(raw.message || '').trim();
  if (!senderName || !senderEmail.includes('@')) {
    return { ok: false, reason: 'required' };
  }
  if (message.length < CONTACT_MESSAGE_MIN) {
    return { ok: false, reason: 'message_min' };
  }
  return { ok: true, value: { senderName, senderEmail, senderPhone, message } };
}
