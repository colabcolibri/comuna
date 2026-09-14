---
title: Test strategy
status: draft
version: 1.0
updated: 2026-09-14
depends_on: [01_tech_stack.md, 04_principles.md, 08_environments.md]
blocks: []
---

# 10 — Test strategy

## Overview

- **Test stack id:** `ts-vitest` (Vitest para Testes Unitários/Integração + Playwright para E2E).
- **CI:** Integrado via GitHub Actions conforme definido em [08_environments.md](08_environments.md).

## Pyramid

| Level | Scope | Target % of tests | Focus Areas |
| ----- | ----- | ----------------- | ----------- |
| Unit | Pure logic, utilitários, geradores OTP e sanitização | ~60% | Hashing de código OTP, sanitização de campos de perfil, checagens de RBAC |
| Integration | Módulos de API (Auth, Perfis, Busca) & Banco de Dados | ~30% | Geração/Validação de OTP com PostgreSQL, endpoints `/api/profiles` e RBAC de coordenação |
| E2E | Fluxos críticos de usuário na Web | ~10% | Fluxo completo de Login Passwordless e envio de contato mediado ao Alumni |

## Runners

| Layer | Tool | Config path | Command |
| ----- | ---- | ----------- | ------- |
| Unit / Integration | Vitest | `vitest.config.ts` | `pnpm test` |
| E2E | Playwright | `playwright.config.ts` | `pnpm test:e2e` |

## Layout & Conventions

- Testes Unitários/Integração colocados ao lado do código ou em `__tests__/` (ex: `src/lib/auth.test.ts`).
- Testes E2E armazenados na pasta raiz `tests/e2e/`.

## Coverage

- **Tool:** Vitest built-in v8 coverage.
- **Threshold:** 70% de cobertura em código de regras de negócio (Auth & Proteção de Privacidade).

## US conventions

- Nenhuma User Story com critério de segurança ou auth pode ser fechada sem testes automatizados correspondentes.
