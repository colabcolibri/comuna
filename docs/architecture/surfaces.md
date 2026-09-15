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
- **Monta** só plugins `enabled` da comunidade atual (nav, home, campos, CTA). Sem link órfão.
- **Cookie:** sessão membro.

## apps/admin

- **Users:** `super_admin`.
- **Visual:** shell denso (`packages/ui/admin`).
- **Jobs:** comunidades, pessoas da rede (assentos e papéis), coordenadores, **toggle de módulos**, catálogo de campos do tenant.
- **Cookie:** `ops_token` (alvo).
- **IA do chrome:** o rail é a rede. Itens globais: **comunidades** e **pessoas**. Ao abrir um tenant, o rail ganha o grupo “nesta comunidade” (dados, plugins, membros, campos). Capítulos não ficam em tabs no miolo.
- **Adicionar membro:** combobox com typeahead (`q` ≥ 2, teto 20). Ops não lista a base inteira num `<select>`. O roster da comunidade (tabela) ainda é a lista deste tenant — paginar se passar da casa dos milhares.

## Same database

Um Postgres. Admin não substitui o diretório da web.

## Reversal

v2.0.0 **inclui** o segundo app. Path `/ops` no mesmo Next deixa de ser o alvo permanente.
