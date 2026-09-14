---
title: Test strategy
status: draft
version: 1.1
updated: 2026-09-14
depends_on: [01_tech_stack.md, 04_principles.md, 08_environments.md]
blocks: []
---

# 10 — Test strategy

## Overview

- **Test stack id:** `ts-vitest`. Playwright entra quando a auth persistir (não fechar US de auth só com unit de hash).
- **CI:** lint + `npm test` no `08` (Actions ainda a documentar/criar).

## Pyramid

| Level | Scope | Target % of tests | Focus |
| ----- | ----- | ----------------- | ----- |
| Unit | OTP hash, RBAC, sanitização, SQL builders | ~60% | `src/lib/**` |
| Integration | Rotas + Postgres de teste | ~30% | OTP persistido, isolamento `community_id` |
| E2E | Login real, contato, fila coord | ~10% | Playwright quando Mailpit + DB existirem |

## Runners

| Layer | Tool | Config | Command |
| ----- | ---- | ------ | ------- |
| Unit / Integration | Vitest | `vitest.config.ts` | `npm test` |
| E2E | Playwright | `playwright.config.ts` (alvo) | `npm run test:e2e` |

Hoje só existem testes ao lado de `src/lib/**/*.test.ts` e `templates.test.tsx`. Não há E2E.

## Layout & conventions

- Unit ao lado do módulo.
- Integração de API: testar handlers com DB de teste **sem** reset destrutivo da base de dev do manager.
- E2E em `tests/e2e/`.

## Coverage

- Vitest v8. Alvo 70% em `src/lib/auth` e projeção de privacidade.

## US conventions

- US de auth, privacidade e isolamento: `tests: required`.
- UI Stitch: teste de regressão visual não é obrigatório na v2.0.0; aceite é inspeção contra HTML/screenshot + checklist `09`.
