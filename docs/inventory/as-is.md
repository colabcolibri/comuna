---
title: As-is inventory
status: draft
created: 2026-09-14
updated: 2026-09-14
purpose: transitional
promoted_to: [docs/00_scope.md, docs/05_architecture.md]
---

# As-is inventory

> Map of what already exists in the codebase **before** the v2.0.0 backlog.
> Rows with **high** confidence feed `00_scope`, `05_architecture`, and epic candidates.
> **Do not** create retroactive user stories with `✅` from this file.

## How to read this file

| Column | Meaning |
| ------ | ------- |
| Capability | User-facing behavior in plain language — not folder names |
| Evidence | Paths, routes, models, or docs that prove it exists |
| Confidence | `high` · `medium` · `low` — how sure the inference is |
| Epic candidate | Suggested epic for **forward** work |
| Gaps | Unknown behavior, missing tests, tech debt, or questions for the manager |

## Capabilities

| Capability | Evidence | Confidence | Epic candidate | Gaps |
| ---------- | -------- | ---------- | -------------- | ---- |
| Tela de OTP (pedido + código) | `src/app/page.tsx`, `src/components/AppOtpForm.tsx` | high | EPIC-12 / EPIC-17 | Layout não segue Stitch; OTP volta no JSON (`dev_otp`) |
| Pedido de OTP sem persistência | `src/app/api/auth/request-otp/route.ts`, `src/lib/auth/otp.ts` | high | EPIC-12 | Só loga no terminal; não grava `verification_tokens`; não envia e-mail |
| “Login” sem JWT real | `src/app/api/auth/verify-otp/route.ts` | high | EPIC-12 | Cookie `token_simulado_*`; papel `admin` se e-mail for `admin@alumni.org` |
| Funções puras de perfil/busca/vitrine/aprovação | `src/lib/profiles/*`, `src/lib/showcase/*`, `src/lib/admin/approval.ts` + testes Vitest | high | EPIC-13–16 | Sem Postgres; dados em memória/fixture |
| Páginas de perfil, diretório, vitrine, “admin” | `src/app/profile/edit`, `directory`, `showcase`, `admin/approvals` | high | EPIC-14–17 | Shell visual; navbar mistura Moderação com a app do membro |
| Primitives shadcn + templates | `src/components/ui/*`, `src/components/templates/*` | high | EPIC-17 | Templates genéricos; `09` ainda aponta paths `components/app/` que não existem |
| i18n PT/EN | `src/lib/i18n/*`, `AppNavbar` | medium | EPIC-17 | Não é contrato de produto; idioma do Stitch é PT-BR |
| PostgreSQL no compose | `docker-compose.yml`, `pg` no `package.json` | high | EPIC-11 | Sem pasta de migrações de produto; kit Meridian tem SQL só em `.agent/migrations/` |
| Design Stitch de referência | `docs/stitch/html`, `screenshots`, `DESIGN.md` | high | EPIC-17 | Contrato visual ainda é `09`; HTML não está aplicado nas rotas |

## Assumptions (needs human review)

- As US `✅` da v1.0.0–v1.2.0 atestaram um esqueleto e funções puras, não persistência nem fidelidade Stitch.
- Super-admin não deve continuar sendo “o mesmo login com e-mail mágico”.

## Promotion checklist

- [x] Product behavior → `docs/00_scope.md` (current state)
- [x] Users / roles → `docs/03_user_types.md`
- [x] System structure → `docs/05_architecture.md` (status `review`)
- [x] Data model → `docs/06_database.md`
- [x] APIs → `docs/07_api_contracts.md`
- [ ] Large capability block → new epics in SQLite (v2.0.0)
- [ ] Past technical choice → `prepend-decision`

## Open questions

- Provedor de e-mail em produção (Resend vs SES) — ainda aberto no `00`.
- Host do ops (`admin.` vs path `/ops`) na v2.0.0 — ver `05` § Surfaces.
