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
- **Jobs:** comunidades, coordenadores, **toggle de módulos**, catálogo de campos do tenant.
- **Cookie:** `ops_token` (alvo).
- **IA do chrome:** o rail é a rede. Item único na lista: comunidades. Ao abrir um tenant, o rail ganha o grupo “nesta comunidade” (dados, plugins, membros, campos). Capítulos não ficam em tabs no miolo e não são itens globais da barra.

## Same database

Um Postgres. Admin não substitui o diretório da web.

## Reversal

v2.0.0 **inclui** o segundo app. Path `/ops` no mesmo Next deixa de ser o alvo permanente.
