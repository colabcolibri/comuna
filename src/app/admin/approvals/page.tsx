'use client';

import React, { useState } from 'react';
import { AppCardTemplate } from '@/components/templates/AppCardTemplate';
import { AppDialogTemplate } from '@/components/templates/AppDialogTemplate';
import { AppAlertTemplate } from '@/components/templates/AppAlertTemplate';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n/I18nContext';

interface PendingMember {
  id: string;
  name: string;
  email: string;
  requestedAt: string;
  cohort: string;
}

const INITIAL_PENDING: PendingMember[] = [
  { id: '101', name: 'Lucas Gabriel Mendes', email: 'lucas.mendes@example.com', requestedAt: '2026-09-14 10:30', cohort: 'Turma de Engenharia 2024' },
  { id: '102', name: 'Juliana Rocha', email: 'juliana.rocha@example.com', requestedAt: '2026-09-14 11:15', cohort: 'Edição de Inverno IA 2024' },
];

export default function AdminApprovalsPage() {
  const { lang, t } = useI18n();
  const [pendingList, setPendingList] = useState<PendingMember[]>(INITIAL_PENDING);
  const [selectedReject, setSelectedReject] = useState<PendingMember | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionAlert, setActionAlert] = useState<{ variant: 'success' | 'destructive'; msg: string } | null>(null);

  const handleApprove = (id: string, name: string) => {
    setPendingList((prev) => prev.filter((item) => item.id !== id));
    setActionAlert({ variant: 'success', msg: lang === 'pt' ? `Cadastro de ${name} aprovado com sucesso!` : `Registration for ${name} approved successfully!` });
    setTimeout(() => setActionAlert(null), 3500);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReject) return;
    const name = selectedReject.name;
    setPendingList((prev) => prev.filter((item) => item.id !== selectedReject.id));
    setSelectedReject(null);
    setRejectReason('');
    setActionAlert({ variant: 'destructive', msg: lang === 'pt' ? `Solicitação de ${name} rejeitada.` : `Request from ${name} rejected.` });
    setTimeout(() => setActionAlert(null), 3500);
  };

  return (
    <main style={{ maxWidth: '950px', margin: '2.5rem auto', padding: '0 1.5rem', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>{t.admin.title}</h1>
        <p style={{ color: '#475569', fontSize: '1.125rem', margin: 0 }}>{t.admin.subtitle}</p>
      </header>

      {actionAlert && (
        <div style={{ marginBottom: '1.5rem' }}>
          <AppAlertTemplate variant={actionAlert.variant} message={actionAlert.msg} />
        </div>
      )}

      {pendingList.length === 0 ? (
        <AppCardTemplate
          title={t.admin.emptyTitle}
          content={<p style={{ color: '#64748b', margin: 0 }}>{t.admin.emptyDesc}</p>}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {pendingList.map((member) => (
            <AppCardTemplate
              key={member.id}
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{member.name}</span>
                  <span style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '0.15rem 0.6rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600 }}>
                    ⏳ {lang === 'pt' ? 'Pendente de Aprovação' : 'Pending Approval'}
                  </span>
                </div>
              }
              subtitle={`E-mail: ${member.email} • ${member.cohort} • ${lang === 'pt' ? 'Solicitado em' : 'Requested at'}: ${member.requestedAt}`}
              content={
                <p style={{ fontSize: '0.9375rem', color: '#475569', margin: 0 }}>
                  {lang === 'pt' ? 'Aguardando validação da coordenação para liberação do acesso ao diretório interno.' : 'Awaiting coordination validation for internal directory access.'}
                </p>
              }
              footer={
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', width: '100%' }}>
                  <Button variant="destructive" size="sm" onClick={() => setSelectedReject(member)}>
                    {t.admin.rejectBtn}
                  </Button>
                  <Button variant="default" size="sm" onClick={() => handleApprove(member.id, member.name)}>
                    {t.admin.approveBtn}
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
        title={`${t.admin.rejectTitle} ${selectedReject?.name}`}
        description={t.admin.rejectDesc}
        content={
          <form id="reject-form" onSubmit={handleConfirmReject}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>{t.admin.reasonLabel}</label>
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
            <Button variant="outline" onClick={() => setSelectedReject(null)}>{lang === 'pt' ? 'Cancelar' : 'Cancel'}</Button>
            <Button variant="destructive" type="submit" form="reject-form">{t.admin.confirmReject}</Button>
          </>
        }
      />
    </main>
  );
}
