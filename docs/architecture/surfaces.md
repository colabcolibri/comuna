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
- **IA do chrome:** duas peles. **Workspace** (`MemberShell` + sidebar): diretório, perfil, pedidos. **Vitrine** (`AppPublicChrome`, grupo `(public)`): página pública, sem sidebar; header com Entrar ou Comunidade.

## apps/admin

- **Users:** `super_admin`.
- **Visual:** shell denso (`packages/ui/admin`).
- **Jobs:** comunidades, pessoas da rede (assentos, papéis, **criar pessoa**), coordenadores, **toggle de módulos**, catálogo de campos do tenant, **plataforma** (`/platform`), **templates de e-mail**, settings do tenant (tipo enum + `settings` jsonb conhecido).
- **Cookie:** `ops_token` (alvo).
- **IA do chrome:** o rail é a rede. Itens globais: **comunidades**, **pessoas**, **plataforma**, **e-mails**. Ao abrir um tenant: dados, plugins, membros, turmas, campos.
- **Adicionar membro:** combobox typeahead (`q` ≥ 2, teto 20). Roster e pessoas da rede paginam de 50; busca no roster/`q` com ≥ 2. Ops muda papel, status (`pending_approval`/`active`/`suspended`), turma e remove membership. **Pedir entrada** é da web (`POST /api/communities/:slug/join`); coordenação delibera na fila do tenant.

## Same database

Um Postgres. Admin não substitui o diretório da web.

## Reversal

v2.0.0 **inclui** o segundo app. Path `/ops` no mesmo Next deixa de ser o alvo permanente.
