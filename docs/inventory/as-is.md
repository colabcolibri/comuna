---
title: As-is inventory
status: draft
created: 2026-09-14
updated: 2026-09-15
purpose: transitional
promoted_to: [docs/00_scope.md, docs/05_architecture.md]
---

# As-is inventory

> Map of what already exists in the codebase **today** (code-derived).
> Rows with **high** confidence should already appear in `00_scope` / `05_architecture`; this file is a living check against drift.
> **Do not** create retroactive user stories with `✅` from this file.
> US-0082–0093 exist as **backfill** (join, public showcase, cohorts, admin membership cycle, multi-community seed, catalog enabled/help). `ready` on those rows may still be in flux — do not close them from this inventory.

## Audit note (2026-09-15)

This file was **stale**: it still described in-memory OTP, a simulated cookie, and “no product migrations.” Code is Postgres + hashed OTP in `auth_core.verification_tokens` + JWT cookies + `apps/web` + `apps/admin` + first-party plugins.

Phase docs in `docs/README.md` remain `approved` (human-only). This pass does **not** rewrite `00_scope` or `05_architecture`. `00_scope.md` frontmatter in the tree is `status: review` while README says `approved` — flag for a later `/audit-docs`, not for this inventory.

## How to read this file

| Column | Meaning |
| ------ | ------- |
| Capability | User-facing behavior in plain language — not folder names |
| Evidence | Paths, routes, models, or docs that prove it exists |
| Confidence | `high` · `medium` · `low` — how sure the inference is |
| Epic candidate | Suggested epic for **forward** work (label only) |
| Gaps | Unknown behavior, missing tests, tech debt, or questions for the manager |

## Capabilities

| Capability | Evidence | Confidence | Epic candidate | Gaps |
| ---------- | -------- | ---------- | -------------- | ---- |
| Pedido de OTP persistido e enviado por e-mail | `packages/core/auth/src/issue-otp.ts` (`auth_core.verification_tokens`); `apps/web/src/app/api/auth/request-otp/route.ts`; `packages/core/mail` `sendKindEmail` kind `member_otp`; Mailpit em `docker-compose.yml` | high | núcleo auth | Rate-limit por IP ainda em memória no route handler; provedor de e-mail de produção aberto no `00` |
| Login membro com JWT (cookie `auth_token`) | `packages/core/auth/src/consume-otp.ts`; `apps/web/src/app/api/auth/verify-otp/route.ts` (`signMemberToken`); `packages/core/auth/src/session.ts` (`jose`) | high | núcleo auth | Não há “cookie simulado”; papel não vem de e-mail mágico |
| Login ops só para `super_admin` (cookie `ops_token`, audience `ops`) | `apps/admin/app/api/admin/auth/verify-otp/route.ts`; `signOpsToken` / `OPS_COOKIE`; `isSuperAdmin` | high | ops | Super-admin não deve usar o mesmo fluxo de membro; web devolve 403 “Use o admin” em join/coord |
| Tela de OTP (pedido + código) | `apps/web/src/components/app/OtpCard.tsx`; login público `apps/web/src/app/(public)/login` | high | núcleo auth | App admin tem rotas de auth próprias |
| Duas apps Next no monorepo | `apps/web`, `apps/admin` (`(ops)`: communities, members, fields, modules, cohorts, lists, emails, platform) | high | ops | Porta ops / host de produção ainda aberto no `00` |
| Workspace por comunidade `/c/{slug}` | `apps/web/src/app/(workspace)/c/[slug]/directory`, `profile`, `profile/edit`, `coord/approvals`; switcher de comunidade | high | núcleo membership | Rotas sem slug ainda existem (`/directory`, `/profile`) — legado de navegação |
| Pedir para entrar na comunidade | `POST` `apps/web/src/app/api/communities/[slug]/join/route.ts`; `packages/core/memberships/src/join-requests.ts`; `JoinCta` / `CommunityJoinBar` | high | núcleo membership | Backfill US-0082+; conferir `ready` no SQLite |
| Coordenador delibera pedidos | `apps/web/src/app/api/coord/approvals/route.ts`; `decideJoinRequest`; páginas `coord/approvals` | high | núcleo membership | Super-admin é recusado neste fluxo |
| Ciclo de membership no ops (status / papel / coorte) | `apps/admin/app/api/admin/memberships/[id]/status/route.ts` (`setNetworkStatus`); `.../role`; `.../cohort`; `community-membership-actions.tsx` | high | ops | Backfill US admin membership cycle |
| Coortes por comunidade | `packages/core/memberships/src/cohorts.ts`; `network_core.cohorts`; ops `communities/[id]/cohorts` | high | ops | Seed define turmas por comunidade em `scripts/seed-communities.cjs` |
| Perfil-base e escrita no Postgres | `apps/web/src/app/api/profiles/me/route.ts`; `person_core.profiles`; `packages/core/identity` | high | núcleo identidade | Não há fixture in-memory para perfil |
| Diretório de membros (plugin) | `packages/modules/directory`; `apps/web/src/app/(workspace)/c/[slug]/directory`; `api/directory/members`; `moduleRuntime.isEnabled` | high | plugin directory | UI some se o módulo estiver off |
| Catálogo de campos (enabled + ajuda) | `plugin_directory.fields` `enabled`; `description` localizado; `packages/modules/directory/src/catalog.ts` / `ops-catalog-fields.ts`; migrações `20260915171227_catalog_enabled.sql`, `20260915195831_field_descriptions.sql`; ops `communities/[id]/fields` | high | plugin directory | Backfill catalog enabled/help; copy de ajuda ainda é seed + ops |
| Listas directory/showcase (placement / filtro) | `packages/modules/directory/src/list-fields.ts`, `list-view.ts`; ops `communities/[id]/lists`; migração `20260915204237_list_fields.sql` | medium | plugin directory | Presente no worktree; confirmar se já está na linha de entrega / testes de página |
| Vitrine pública por slug | `apps/web/src/app/(public)/c/[slug]/showcase/page.tsx`; `listPublicProfiles`; plugin `showcase`; `is_public_showcase` no seed | high | plugin showcase | Vitrine global `/(public)/showcase` ainda existe — conferir se é redirect/agregado |
| Contato mediado (plugin) | `packages/modules/contact-mediated`; `apps/web/src/app/api/contact/[membershipId]/route.ts`; e-mail kind `contact_notice`; 404 se módulo off | high | plugin contact | Destino é e-mail do membro, não inbox in-app |
| Runtime de plugins por tenant | `packages/core/module-runtime`; `network_core.community_modules`; ops `communities/[id]/modules`; migração `db/migrations/20260914233353_core_schemas.sql` + plugin catalog | high | núcleo plugins | First-party: directory, showcase, contact-mediated |
| Migrações de produto datadas | `db/migrations/*.sql` (núcleo `20260914233353`, plugins, RLS, catálogo, lists) | high | dados | Kit Meridian em `.agent/migrations/` **não** substitui esta pasta |
| Seed multi-comunidade + pessoas + catálogo | `scripts/seed-communities.cjs`, `seed-demo-people.cjs`, `seed-directory-catalog.cjs`, `seed-membership-cards.cjs` | high | dados | Hospitalidade só na comunidade demo (campo extra) |
| i18n PT-BR / EN | packs `core_web` / `core_admin` / `core_membership`; `CONTENT` nos componentes | high | chrome | — |
| Primitives + compostos membro | `packages/ui/primitives`, `packages/ui/member` | high | chrome | Stitch HTML em `docs/stitch/` ainda é referência, não a fonte runtime |
| Design Stitch de referência | `docs/stitch/html`, `DESIGN.md`, `docs/09_design_system.md` | high | chrome | HTML de referência pode divergir das rotas reais |

## Assumptions (needs human review)

- As US `✅` da v1.0.0–v1.2.0 atestaram um esqueleto; o código **atual** já passou disso (Postgres, OTP, JWT, duas apps). Não reler aquelas US como descrição do runtime.
- Super-admin entra só no app admin (JWT ops), não por e-mail `admin@…` no fluxo membro.
- US-0082–0093 são backfill do que o código já faz; inventário não as marca `✅` nem altera `ready`.
- `05_architecture` no README está `approved`; o template Mode B sugeriria arquivar este inventário. Mantido em `draft` a pedido (mapa contra drift), não como segunda fonte de escopo.

## Promotion checklist

- [x] Product behavior → `docs/00_scope.md` (current state — one paragraph already cites Postgres, OTP, `/c/{slug}`, ops)
- [x] Users / roles → `docs/03_user_types.md`
- [x] System structure → `docs/05_architecture.md`
- [x] Data model → `docs/06_database.md`
- [x] APIs → `docs/07_api_contracts.md`
- [ ] Large capability block → new epics in SQLite (só trabalho **à frente**, não backfill com `✅`)
- [ ] Past technical choice → `prepend-decision` (este refresh de inventário não mudou decisão de produto)
- [ ] Human: arquivar `docs/inventory/as-is.md` quando o mapa de código não for mais necessário

## Open questions

- Provedor de e-mail em produção (Resend vs SES) — ainda aberto no `00`.
- Host do ops (`admin.` vs path `/ops` vs porta local) — ver `05` § Surfaces e `00` Q3.
- Alinhar `docs/00_scope.md` `status: review` com `docs/README.md` `approved` (humano).
