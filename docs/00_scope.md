---
title: Scope
status: draft
version: 1.3
updated: 2026-09-14
depends_on: []
blocks: [01_tech_stack.md, 04_principles.md, 05_architecture.md]
---

# 00 — Scope

## Name and description

**Product name:** Community Platform

Plataforma web **genérica de comunidades** (não um produto “só alumni”). Uma comunidade é um tenant com membros, papéis e um diretório de pessoas. Alumni, turma, prática, incubadora ou mentoria são **tipos** de comunidade e/ou **plugins** de campos — não o núcleo. O núcleo é: identidade, comunidade, membership, perfil-base. Tudo que alimenta diretório especial, vitrine, contato mediado ou campos extras é **módulo ligável** por comunidade (padrão BuddyBoss / Moodle: componente instalado, ligado ou desligado no tenant).

Duas apps no monorepo: **web** (membros, visitantes, coordenadores) e **admin** (super-admin). Mesmo Postgres.

## Problem it solves

**Before:** Cada rede improvisa planilha + WhatsApp. Softwares de comunidade puxam feed, chat e um perfil inchado. Não há um núcleo estável de “pessoas + comunidades” com extensões desligáveis.

**After:** Operador cria comunidades. Membro tem perfil-base. Coordenador aprova entrada. Diretório e extras só existem se o módulo estiver ligado naquela comunidade.

**Why now:** O repo ainda está nomeado alumni e o código assume “ex-aluno”. O modelo 06 já era multi-tenant; o produto e as pastas precisam acompanhar.

## Who it is for

| Audience | Role / context | Technical level | Primary need |
| -------- | -------------- | --------------- | ------------ |
| Membro | Pessoa autenticada com membership `member` | Variado | Perfil-base; participar da comunidade; usar módulos ligados |
| Coordenador | `network_role` na membership | Médio | Aprovar entrada **dessa** comunidade |
| Visitante | Externo | Baixo | Ver o que o módulo de vitrine permitir (se ligado) |
| Super-admin | `global_role` ops | Alto | Criar comunidades, ligar/desligar módulos, atribuir coordenadores — app **admin** |

## Current product state

`src/` é um Next único com copy e rotas de alumni. OTP simulado. Sem migrações. Sem runtime de plugins. Inventário: `docs/inventory/as-is.md`. Árvore-alvo: `docs/architecture/monorepo.md`.

## In initial scope (v2.0.0)

1. Núcleo: OTP, Postgres, pessoa (perfil-base), comunidades, memberships, coordenação de entrada.
2. Runtime de módulos: catálogo + `community_modules.enabled`; app web **não** monta UI de plugin desligado.
3. Plugins de primeira: `directory` (campos e busca além do base), `showcase`, `contact-mediated`.
4. App **admin** no monorepo (não navbar Stitch): comunidades, papéis, toggle de módulos.
5. i18n: locales `pt-BR` (default) e `en`; **zero** string de UI hardcoded; `CONTENT` no topo de cada arquivo de UI (ver `09`).
6. Migrações `YYYYMMDDHHMMSS` incluindo `plugin_core`.

## Out of initial scope

- Marketplace de plugins de terceiros (só first-party na v2).
- Chat, fórum, feed (estilo Circle/BuddyBoss activity).
- Pagamentos, OAuth, apps nativos, MFA.
- Tradução profissional de e-mails legais.

## Known constraints

| Type | Constraint | Impact |
| ---- | ---------- | ------ |
| Núcleo vs plugin | Diretório rico não é core | Schema e UI de skills/headline não entram em `person_core` |
| Monorepo | Duas apps | Dois deploys ou dois processes; pacotes compartilhados |
| Copy | `CONTENT` no arquivo | Sem `t.nav.admin` espalhado; sem JSX com português cru |

## Assumptions

| # | Assumption | Confidence | Validate by |
| - | ---------- | ---------- | ----------- |
| 1 | Primeira comunidade de demo pode ser tipo `alumni` | High | Seed |
| 2 | Coordenação de entrada é núcleo (como enrol Moodle), não plugin | Medium | Manager — se discordar, vira plugin na EPIC-19 |
| 3 | OTP por e-mail serve qualquer comunidade | High | Uso |

## Open questions

| # | Question | Owner | Target |
| - | -------- | ----- | ------ |
| 1 | Provedor de e-mail em produção? | manager | S2 |
| 2 | Gênero e cidade atual: base ou plugin `person-demographics` / `person-location`? Proposta: **plugin** (perfil-base só nome, avatar, locale). | manager | S1 |
| 3 | Admin em subdomínio vs porta local distinta? | manager | S1 monorepo |

## Gate

Human `approved` neste charter. `05` permanece `review`.
