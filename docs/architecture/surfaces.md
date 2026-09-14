---
title: Member vs admin surfaces
updated: 2026-09-14
source: docs/05_architecture.md
---

# Surfaces — web vs admin

Volta: `docs/05_architecture.md`.

## apps/web

- **Users:** `guest`, `member`, `coordinator`.
- **Visual:** `09` + Stitch.
- **Monta** só plugins `enabled` da comunidade atual.
- **Cookie:** sessão membro.

## apps/admin

- **Users:** `super_admin`.
- **Visual:** shell denso (`packages/ui/admin`).
- **Jobs:** comunidades, coordenadores, **toggle de módulos**.
- **Cookie:** `ops_token` (alvo).

## Same database

Um Postgres. Admin não substitui o diretório da web.

## Reversal

v2.0.0 **inclui** o segundo app. Path `/ops` no mesmo Next deixa de ser o alvo permanente.
