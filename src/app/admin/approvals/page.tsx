'use client';

import React, { useState } from 'react';
import { AppCardTemplate } from '@/components/templates/AppCardTemplate';
import { AppDialogTemplate } from '@/components/templates/AppDialogTemplate';
import { AppAlertTemplate } from '@/components/templates/AppAlertTemplate';
import { Button } from '@/components/ui/button';

interface PendingMember {
  id: string;
  name: string;
  email: string;
  requestedAt: string;
}

const INITIAL_PENDING: PendingMember[] = [
  { id: '101', name: 'Lucas Gabriel Mendes', email: 'lucas.mendes@example.com', requestedAt: '2026-09-14 10:30' },
  { id: '102', name: 'Juliana Rocha', email: 'juliana.rocha@example.com', requestedAt: '2026-09-14 11:15' },
];

export default function AdminApprovalsPage() {
  const [pendingList, setPendingList] = useState<PendingMember[]>(INITIAL_PENDING);
  const [selectedReject, setSelectedReject] = useState<PendingMember | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionAlert, setActionAlert] = useState<{ variant: 'success' | 'destructive'; msg: string } | null>(null);

  const handleApprove = (id: string, name: string) => {
    setPendingList((prev) => prev.filter((item) => item.id !== id));
    setActionAlert({ variant: 'success', msg: `Cadastro de ${name} aprovado com sucesso!` });
    setTimeout(() => setActionAlert(null), 3500);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReject) return;
    const name = selectedReject.name;
    setPendingList((prev) => prev.filter((item) => item.id !== selectedReject.id));
    setSelectedReject(null);
    setRejectReason('');
    setActionAlert({ variant: 'destructive', msg: `Solicitação de ${name} rejeitada.` });
    setTimeout(() => setActionAlert(null), 3500);
  };

  return (
    <main style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#0f172a' }}>🛡️ Painel de Moderação & Aprovações</h1>
        <p style={{ color: '#64748b' }}>Área de acesso restrito a Coordenadores e Administradores para validação de novos ex-alunos.</p>
      </header>

      {actionAlert && (
        <div style={{ marginBottom: '1.5rem' }}>
          <AppAlertTemplate variant={actionAlert.variant} message={actionAlert.msg} />
        </div>
      )}

      {pendingList.length === 0 ? (
        <AppCardTemplate
          title="Fila de Aprovação Vazia"
          content={<p style={{ color: '#64748b', margin: 0 }}>Não há solicitações de cadastro pendentes no momento.</p>}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {pendingList.map((member) => (
            <AppCardTemplate
              key={member.id}
              title={member.name}
              subtitle={`E-mail: ${member.email} • Solicitado em: ${member.requestedAt}`}
              content={
                <p style={{ fontSize: '0.875rem', color: '#475569', margin: 0 }}>
                  Aguardando validação da coordenação para liberação de acesso ao diretório interno.
                </p>
              }
              footer={
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', width: '100%' }}>
                  <Button variant="destructive" size="sm" onClick={() => setSelectedReject(member)}>
                    Rejeitar
                  </Button>
                  <Button variant="default" size="sm" onClick={() => handleApprove(member.id, member.name)}>
                    Aprovar Membro
                  </Button>
                </div>
              }
            />
          ))}
        </div>
      )}

      <AppDialogTemplate
        isOpen={!!selectedReject}
        onClose={() => setSelectedReject(null)}
        title={`Rejeitar Solicitação de ${selectedReject?.name}`}
        description="Forneça uma justificativa para registrar na auditoria e enviar ao solicitante."
        content={
          <form id="reject-form" onSubmit={handleConfirmReject}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Motivo da Rejeição</label>
            <textarea
              required
              rows={3}
              placeholder="Ex: Dados inconsistentes com o registro da instituição..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
            />
          </form>
        }
        actions={
          <>
            <Button variant="outline" onClick={() => setSelectedReject(null)}>Cancelar</Button>
            <Button variant="destructive" type="submit" form="reject-form">Confirmar Rejeição</Button>
          </>
        }
      />
    </main>
  );
}
