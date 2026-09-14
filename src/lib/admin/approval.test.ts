import { describe, it, expect } from 'vitest';
import { processMemberApproval, ApprovalInput } from './approval';

describe('Moderation and Approval Module (US-0007)', () => {
  it('deve aprovar cadastro de membro e gerar log de auditoria da coordenacao', () => {
    const input: ApprovalInput = {
      target_user_id: 'user_789',
      actioned_by_user_id: 'coord_101',
      action: 'approve',
      reason: 'Comprovante de turma 2023 verificado com sucesso'
    };

    const result = processMemberApproval(input);
    expect(result.success).toBe(true);
    expect(result.new_status).toBe('active');
    expect(result.audit_log.reason).toContain('turma 2023');
  });

  it('deve rejeitar/suspender cadastro quando indicado', () => {
    const input: ApprovalInput = {
      target_user_id: 'user_000',
      actioned_by_user_id: 'coord_101',
      action: 'reject',
      reason: 'Nenhum vinculo com a instituicao encontrado'
    };

    const result = processMemberApproval(input);
    expect(result.success).toBe(true);
    expect(result.new_status).toBe('suspended');
  });
});
