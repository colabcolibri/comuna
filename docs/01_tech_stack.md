---
title: Tech Stack
status: draft
version: 1.0
updated: 2026-09-14
depends_on: [00_scope.md]
blocks: [02_security.md, 04_principles.md, 08_environments.md, 09_design_system.md, 10_test_strategy.md]
---

# 01 — Tech stack

## Summary

A stack tecnológica do **Alumni Platform** foca em desenvolvimento web moderno, segurança para autenticação passwordless e facilidade de manutenção para gerenciar os perfis de ex-alunos, vitrine de contratação e visibilidade restrita.

## Runtime and language

| Layer | Technology | Version (if pinned) | Rationale |
| ----- | ---------- | ------------------- | --------- |
| Primary language | TypeScript | ^5.0 | Tipagem estática fim a fim para modelos de perfil e contratos de API |
| Runtime | Node.js | ^20 LTS | Ecossistema maduro e amplo suporte para bibliotecas web e envio de e-mail |
| Package manager | pnpm / npm | latest | Gerenciamento eficiente de dependências |

## Application surfaces

| Surface | Framework / host | Path in repo | Notes |
| ------- | ---------------- | ------------ | ----- |
| Web app | Next.js ^16.3.5 / React Server Components | `src/` ou `app/` | SSR/SSG para vitrine pública de talentos e SEO |
| API / backend | Next.js API Routes / Server Actions | `src/app/api/` | Rotas de API integradas para auth passwordless e busca |
| CLI | n/a | n/a | Fora de escopo |
| Mobile | n/a | n/a | Fora de escopo na v1 |

## Data layer

| Concern | Choice | Config / path | Notes |
| ------- | ------ | ------------- | ----- |
| Database | PostgreSQL | `prisma/` ou `drizzle/` | Banco relacional para estruturar usuários, perfis, talentos e permissões |
| Cache / Sessions | Redis / In-Memory Store | `src/lib/redis.ts` | Armazenamento temporário de códigos de verificação OTP de e-mail |

## Dev tooling

| Tool | Choice | Config path | Notes |
| ---- | ------ | ----------- | ----- |
| Linter / Formatter | ESLint + Prettier | `.eslintrc.json` | Padronização de código |
| Test runner | Vitest / Jest | `vitest.config.ts` | Testes unitários e de integração |

## Discarded alternatives

- **Autenticação com Senha Tradicional:** Descartada em favor de OTP/Magic Link por e-mail para simplificar o fluxo de login dos alumni e evitar vazamento de credenciais.

## Gaps / open questions

| # | Question / Gap | Impact |
| - | -------------- | ------ |
| 1 | Definição exata do ORM (Prisma vs Drizzle) | A ser decidido em 05_architecture |
