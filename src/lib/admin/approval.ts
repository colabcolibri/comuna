export interface ApprovalInput {
  target_user_id: string;
  actioned_by_user_id: string;
  action: 'approve' | 'reject' | 'suspend';
  reason: string;
}

export function processMemberApproval(input: ApprovalInput) {
  const newStatus = input.action === 'approve' ? 'active' : 'suspended';

  return {
    success: true,
    target_user_id: input.target_user_id,
    new_status: newStatus,
    audit_log: {
      actioned_by: input.actioned_by_user_id,
      action: input.action,
      reason: input.reason,
      created_at: new Date().toISOString()
    }
  };
}
