---
title: Engineering Principles
status: review
version: 1.3
updated: 2026-09-15
depends_on: [00_scope.md]
blocks: [05_architecture.md]
---

# 04 — Engineering principles

## Core principles

1. **Núcleo estreito:** pessoa + comunidade + membership. Extensão = módulo.
2. **Plugin board:** UI e SQL de feature extra não entram no core “por enquanto”.
3. **Duas apps:** web ≠ admin.
4. **Copy de interface:** pack por componente; `CONTENT` no topo do arquivo de UI; sem string crua no JSX.
5. **Documentação precede código.**

## DRY — where logic lives

| Concern | Canonical path (alvo) | Must not |
| ------- | ---------------------- | -------- |
| OTP / JWT | `packages/core/auth` | Duplicar nas duas apps |
| Pool / SQL | `packages/core/db` | `pg` nas páginas |
| Perfil-base + chrome i18n | `packages/core/identity` | HTTP de geocoder, skills |
| Lugar | `packages/core/places` | React, SQL. Adapters atrás de `CityDirectory`. Não é plugin. |
| Ficheiros (avatar) | `packages/core/files` | `public/`, bytea, páginas com `fs` |
| Comunidades / membership | `packages/core/communities`, `memberships` | |
| Module runtime | `packages/core/module-runtime` | `if (community.slug === 'alumni')` |
| Directory plugin | `packages/modules/directory` | Tabelas no person_core; catálogo de campos no core |
| Field templates | UI compartilhada + bindings do directory | Select de availability hardcoded na página |
| Showcase / contact | `packages/modules/showcase`, `contact-mediated` | |
| UI strings | Pack + `CONTENT` no arquivo de UI | Dump central `translations.ts` |
| Member UI | `packages/ui/member` | Tokens da vitrine no admin |
| Admin UI | `packages/ui/admin` | Stitch obrigatório |
| shadcn primitives | `packages/ui/primitives` | Copiar `components/ui` nas apps |

## Single responsibility — layers

| Layer | Responsibility | May import | Must not |
| ----- | -------------- | ---------- | -------- |
| `apps/web` | Rotas membro, montar plugins enabled | core + modules + ui + ui/member | SQL direto |
| `apps/admin` | Ops e toggles | core + ui + ui/admin | Stitch directory |
| `packages/core/*` | Regras estáveis | `db` | React de tela (runtime pode exportar tipos) |
| `packages/modules/*` | Manifest + schema extra + UI opcional | core | Ligar outro módulo por slug mágico |
| `packages/ui/primitives` | shadcn | React | Postgres, rotas Next |
| `packages/ui/member` / `admin` | Compostos | `@community/ui` | Postgres |

## SOLID

- **S:** um pacote de módulo = um slug.
- **O:** comunidade nova = enable flags, não fork do core.

## Definition of Done

- Record + testes.
- Plugin desligado: rota e API do módulo 404/403, sem vazar campos extras.
- UI: nenhuma string visível fora de `CONTENT` / ICU no mesmo arquivo.

## Mandatory conventions

- Slug de módulo: kebab-case (`directory`, `contact-mediated`).
- Migrações datadas; módulo pode trazer SQL prefixado `plugin_<slug>_`.
- i18n: ver `09` § Internationalization.

## Error handling

Envelope `07`. Logs sem OTP/JWT.

## Security-aware coding

Autorização no core; módulo não se auto-habilita.

## Gaps

Árvore `apps/` ainda sem Next movido — EPIC-20.
