import { parseContactPayload } from '@community/contact-mediated';

export interface ContactMessageInput {
  target_member_id: string;
  target_email: string;
  sender_name: string;
  sender_email: string;
  message: string;
}

export function sendMediatedContactMessage(input: ContactMessageInput) {
  const parsed = parseContactPayload({
    sender_name: input.sender_name,
    sender_email: input.sender_email,
    message: input.message,
  });
  if (!parsed.ok) {
    return { success: false, error: 'MISSING_FIELDS' };
  }

  // Disparo simulado de e-mail mediado
  return {
    success: true,
    recipient_email: input.target_email,
    message_body: `Nova proposta de ${input.sender_name} (${input.sender_email}): ${input.message}`
  };
}
