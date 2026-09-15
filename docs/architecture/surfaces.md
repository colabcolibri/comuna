---
title: Member vs admin surfaces
updated: 2026-09-15
source: docs/05_architecture.md
---

# Surfaces — web vs admin

Volta: `docs/05_architecture.md`.

## apps/web

- **Users:** `guest`, `member`, `coordinator`.
- **Visual:** `09` + Stitch.
- **Monta** só plugins `enabled` da comunidade **do contexto** (nav, home, campos, CTA). Sem link órfão.
- **Cookie:** sessão membro (`auth_token`) + `community_slug` (workspace). Detalhe: `docs/architecture/community-context.md`.
- **IA do chrome:** Slack-like. Topo = comunidade (picker só com 2+ memberships). Meio = destinos deste tenant. Rodapé = perfil + Sair. Sem rail Discord e sem lista de canais.

## apps/admin

- **Users:** `super_admin`.
- **Visual:** shell denso (`packages/ui/admin`).
- **Jobs:** comunidades, pessoas da rede (assentos e papéis), coordenadores, **toggle de módulos**, catálogo de campos do tenant.
- **Cookie:** `ops_token` (alvo).
- **IA do chrome:** o rail é a rede. Itens globais: **comunidades** e **pessoas**. Ao abrir um tenant: dados, plugins, membros, turmas, campos.
- **Adicionar membro:** combobox typeahead (`q` ≥ 2, teto 20). Roster e pessoas da rede paginam de 50; busca no roster/`q` com ≥ 2. Ops muda papel, status (`pending_approval`/`active`/`suspended`), turma e remove membership. **Pedir entrada** é da web (`POST /api/communities/:slug/join`); coordenação delibera na fila do tenant.

## Same database

Um Postgres. Admin não substitui o diretório da web.

## Reversal

v2.0.0 **inclui** o segundo app. Path `/ops` no mesmo Next deixa de ser o alvo permanente.
