export interface ContactMessageInput {
  target_member_id: string;
  target_email: string;
  sender_name: string;
  sender_email: string;
  message: string;
}

export function sendMediatedContactMessage(input: ContactMessageInput) {
  // Validação basica
  if (!input.sender_name || !input.sender_email || !input.message) {
    return { success: false, error: 'MISSING_FIELDS' };
  }

  // Disparo simulado de e-mail mediado
  return {
    success: true,
    recipient_email: input.target_email,
    message_body: `Nova proposta de ${input.sender_name} (${input.sender_email}): ${input.message}`
  };
}
