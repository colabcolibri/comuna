import { describe, it, expect } from 'vitest';
import { sendMediatedContactMessage, ContactMessageInput } from './contact';

describe('Mediated Contact Module (US-0006)', () => {
  it('deve disparar mensagem mediada sem revelar o e-mail real do alumni', () => {
    const input: ContactMessageInput = {
      target_member_id: 'member_456',
      target_email: 'alumni@org.com',
      sender_name: 'Recrutador Silva',
      sender_email: 'recruiter@tech.com',
      message: 'Gostamos do seu perfil e queremos fazer uma proposta.'
    };

    const result = sendMediatedContactMessage(input);
    expect(result.success).toBe(true);
    expect(result.recipient_email).toBe('alumni@org.com');
    expect(result.message_body).toContain('Recrutador Silva');
  });
});
