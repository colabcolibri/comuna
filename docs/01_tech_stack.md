---
title: Tech Stack
status: draft
version: 1.2
updated: 2026-09-14
depends_on: [00_scope.md]
blocks: [02_security.md, 04_principles.md, 08_environments.md, 09_design_system.md, 10_test_strategy.md]
---

# 01 — Tech stack

## Summary

Monorepo: duas apps Next (`apps/web`, `apps/admin`) + pacotes (`packages/core/*`, `packages/modules/*`, `packages/ui/*`). PostgreSQL via `pg`. Sem Redis. OTP no Postgres.

Hoje o Next ainda vive na raiz (`src/`). A árvore `apps/` e `packages/` é o contrato; a US de scaffold liga workspaces e move o código.

## Runtime and language

| Layer | Technology | Version | Rationale |
| ----- | ---------- | ------- | --------- |
| Language | TypeScript | ^5.5 | Já no repo |
| Runtime | Node.js | ^20 LTS | Next 16 |
| Workspaces | npm workspaces (alvo) | `package.json` workspaces | Um lockfile; pacotes `@community/*` |

## Application surfaces

| Surface | Framework | Path | Notes |
| ------- | --------- | ---- | ----- |
| Member web | Next.js 16 | `apps/web` (alvo) | Stitch + plugins montados |
| Admin web | Next.js 16 | `apps/admin` (alvo) | Shell ops; toggle módulos |
| Core libs | TS packages | `packages/core/*` | Sem React de página |
| Modules | TS packages | `packages/modules/<slug>` | Manifest + optional UI |
| UI member | React | `packages/ui/member` | Compostos Stitch |
| UI admin | React | `packages/ui/admin` | Tabelas densas |

## Data layer

| Concern | Choice | Path | Notes |
| ------- | ------ | ---- | ----- |
| Database | PostgreSQL | `packages/core/db` | Pool único |
| Migrations | SQL | `db/migrations/` (raiz) ou `packages/core/db/migrations` | `YYYYMMDDHHMMSS`; uma por mudança |
| Module state | `plugin_core` + `community_modules` | 06 | Ligar/desligar por tenant |

## Dev tooling

| Tool | Choice | Notes |
| ----- | ------ | ----- |
| Tests | Vitest | por pacote |
| Lint | ESLint Next | cada app |

## Discarded alternatives

- Um único Next com `/ops` como *substituto* permanente do admin — recusado pelo manager.
- Redis.
- Prisma nesta release.
- Catálogo i18n global tipo `translations.ts` como fonte única — recusado; `CONTENT` no topo do arquivo de UI.

## Gaps

| # | Gap | Impact |
| - | --- | ------ |
| 1 | Next ainda na raiz | US monorepo |
| 2 | SMTP prod | S2 |
