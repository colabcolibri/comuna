import { definePack } from '@community/identity';

export const coreMembershipPack = definePack({
  'pt-BR': {
    'coord.kicker': 'Coordenação',
    'coord.title': 'Pedidos de entrada',
    'coord.subtitle': 'Delibere solicitações de novos membros desta comunidade.',
    'coord.empty': 'Fila vazia.',
    'coord.forbidden': 'Só coordenação desta comunidade.',
    'coord.approve': 'Aprovar',
    'coord.reject': 'Recusar',
    'coord.notice': 'Aprovar dá acesso intermediado ao diretório. Contato permanece protegido.',
  },
  en: {
    'coord.kicker': 'Coordination',
    'coord.title': 'Join requests',
    'coord.subtitle': 'Review requests for this community.',
    'coord.empty': 'Queue is empty.',
    'coord.forbidden': 'Coordinators of this community only.',
    'coord.approve': 'Approve',
    'coord.reject': 'Reject',
    'coord.notice': 'Approval grants mediated directory access. Contact stays protected.',
  },
});
