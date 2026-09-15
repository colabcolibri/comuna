---
title: API Contracts
status: review
version: 1.17
updated: 2026-09-15
depends_on: [05_architecture.md, 06_database.md]
blocks: []
---

# 07 — API contracts

## API style

| Attribute | Value |
| --------- | ----- |
| **Style** | REST JSON via Route Handlers |
| **Base URL** | `/api` |
| **Versioning** | Sem `/v1` na v2.0.0 |
| **Documentation** | Este arquivo |

## Authentication

| Mechanism | Header / Cookie | Consistent with `02_security` |
| --------- | --------------- | ----------------------------- |
| Membro / coord | Cookie `auth_token` HttpOnly | Sim |
| Admin app | Cookie `ops_token` | App `apps/admin` (porta 3015). Sem `/ops` na web. |

## Error envelope

```json
{
  "error": {
    "code": "INVALID_OTP",
    "message": "Código de verificação incorreto ou expirado",
    "details": []
  }
}
```

### Códigos

- `RATE_LIMIT_EXCEEDED` 429
- `UNAUTHORIZED` 401
- `FORBIDDEN` 403
- `NOT_FOUND` 404
- `VALIDATION_ERROR` 400
- `DUPLICATE_EMAIL` 409

`FORBIDDEN` para coord usa `network_role`; ops usa `global_role`. Não misturar os dois códigos de produto.

## Endpoints

| Method | Path | Purpose | Auth | Request | Success |
| ------ | ---- | ------- | ---- | ------- | ------- |
| `POST` | `/api/auth/request-otp` | Envia OTP | Public | `{ "email" }` | `200` `{ "message" }` — **sem** `dev_otp` em prod |
| `POST` | `/api/auth/verify-otp` | Sessão membro | Public | `{ "email", "code" }` | `200` + `Set-Cookie` `auth_token` |
| `POST` | `/api/auth/logout` | Encerra sessão membro | Authenticated | `{}` | `200` + cookie vazio |
| `GET` | `/api/profiles/me` | Perfil-base | Member / coordinator | — | `{ "profile" }` base |
| `PUT` | `/api/profiles/me` | Atualiza perfil-base | Member / coordinator | identidade + demografia + lugares Nominatim | `{ "profile" }` |
| `POST` | `/api/profiles/me/avatar` | Upload de foto | Member | jpeg/png/webp; sem SVG; máximo 2 MB | `{ "avatar_url" }` |
| `GET` | `/api/media/person/:userId/avatar` | Bytes da foto | Public se o objecto existir | — | image/* |
| `GET` | `/api/places/cities` | Busca cidade (Nominatim) | Member | `?q=` | `{ "data": GeoPlace[] }` |
| `PUT` | `/api/memberships/me` | Card do directory | Member; 404 se plugin off | LocalizedText headline/bio, availability, vitrine, `custom_attributes` (só chaves do catálogo) | `{ ok }` |
| `GET` | `/api/me/communities` | Comunidades com membership `active` da pessoa | Member | — | `{ "data": [{ id, slug, name, network_role }] }` |
| `GET` | `/api/community/modules` | Slugs enabled da comunidade do contexto (cookie `community_slug` ou vitrine pública) | Public / member | — | `{ "enabled": ["directory", "showcase"] }` |
| `GET` | `/api/directory/catalog` | Grupos e campos; API **omite** campos cujo `module_id` não está enabled (núcleo sempre). 404 só se o plugin **directory** está off | Member | — | `{ "groups": [ { fields } ] }` |
| `GET` | `/api/directory/members` | Diretório rico | Member; **404 se plugin off** | query + facets | `{ "data", "meta" }` |
| `GET` | `/api/profiles/public` | Vitrine desta comunidade | Public; **404 se plugin off** | `?slug=` ou cookie `community_slug` | `{ "data": PublicProfile[] }` |
| `POST` | `/api/contact/:membershipId` | Contato mediado | Public; **404 se plugin off** | nome, e-mail, mensagem | `200` sem e-mail |
| `GET` | `/api/communities/public` | Comunidades com vitrine pública | Public | — | `{ "data": [{ id, slug, name }] }` |
| `POST` | `/api/communities/:slug/join` | Pedido `pending_approval` (membro autenticado, sem assento) | Member | `{}` | `201` `{ "data": JoinSeat }` |
| `GET` | `/api/coord/approvals` | Fila `pending_approval` deste tenant | Coordinator | — | `{ "pending" }` |
| `POST` | `/api/coord/approvals` | Aprova / recusa | Coordinator | `{ "membershipId", "action": "approve" \| "reject" }` | `{ "status" }` |
| `POST` | `/api/admin/auth/request-otp` | Envia OTP ops | Public, só se o e-mail é `super_admin` | `{ "email" }` | `{ "message" }` |
| `POST` | `/api/admin/auth/verify-otp` | Sessão admin | Public, `super_admin` | OTP | cookie `ops_token` |
| `GET` | `/api/admin/platform` | Settings da instalação + status SMTP | Super-admin | — | settings + `smtp: { configured, host, port, secure, auth }` (sem senha) |
| `PUT` | `/api/admin/platform` | Grava settings da instalação | Super-admin | identity fields; ignora `smtp` | objeto settings |
| `GET` | `/api/admin/email-templates` | Copy default ou overlay + envelope + slot | Super-admin | `?kind=&locale=` | `{ data: TemplateView }` com `subject`, `heading`, `body`, `slot`, `variables`, `envelope`, `previewHtml` |
| `PUT` | `/api/admin/email-templates/:kind` | Overlay de copy | Super-admin | `{ locale, subject, heading, body }` | `{ ok }` |
| `DELETE` | `/api/admin/email-templates/:kind` | Volta ao default | Super-admin | `?locale=` | `{ ok }` |
| `GET` | `/api/admin/people` | Pessoas da rede + assentos. Página de 50. `q` com ≥2 filtra. | Super-admin | `?q=&offset=` | `{ "data", "meta.hasMore" }` |
| `POST` | `/api/admin/people` | Cria user+perfil; envia `person_invite` | Super-admin | `{ "email", "full_name" }` | `201` pessoa; e-mail existente = 409 `DUPLICATE_EMAIL` |
| `GET` | `/api/admin/communities` | Lista comunidades | Super-admin | — | lista |
| `POST` | `/api/admin/communities` | Cria comunidade | Super-admin | `{ "slug", "name" }` | `201` |
| `GET` | `/api/admin/communities/:id` | Lê comunidade | Super-admin | — | `{ id, slug, name, type, is_public_showcase, settings }` |
| `PUT` | `/api/admin/communities/:id` | Nome, tipo enum, vitrine, settings conhecidas | Super-admin | `{ "name", "type?", "is_public_showcase?", "settings?" }` | comunidade |
| `GET` | `/api/admin/communities/:id/modules` | Estado dos plugins | Super-admin | — | `{ "data": [{ slug, enabled }] }` |
| `PUT` | `/api/admin/communities/:id/modules/:slug` | Liga/desliga plugin | Super-admin | `{ "enabled": true }` | `200` |
| `GET` | `/api/admin/communities/:id/memberships` | Roster paginado (50); `?email=` busca uma; `?q=` filtra se ≥2 | Super-admin | `?q=&offset=` | `{ "data", "meta.hasMore" }` ou membership |
| `GET` | `/api/admin/communities/:id/people` | Busca pessoas **fora** deste tenant. `q` min 2; máx 20 hits. Sem `q` (ou curto) = `[]`. | Super-admin | `?q=` | `{ "data": [{ id, email, full_name }] }` |
| `POST` | `/api/admin/communities/:id/memberships` | Liga user existente como membership `active` | Super-admin | `{ "userId", "network_role?" }` | `201` |
| `GET` | `/api/admin/communities/:id/cohorts` | Turmas do tenant | Super-admin | — | `{ "data": CohortRow[] }` |
| `POST` | `/api/admin/communities/:id/cohorts` | Cria turma | Super-admin | `{ "name", "code?" }` | `201` |
| `DELETE` | `/api/admin/communities/:id/cohorts/:cohortId` | Apaga turma; memberships ficam sem turma | Super-admin | — | `{ ok }` |
| `POST` | `/api/admin/memberships/:id/role` | Atribui `member` / `coordinator` | Super-admin | `{ "network_role" }` | `200` |
| `POST` | `/api/admin/memberships/:id/status` | `pending_approval` / `active` / `suspended` | Super-admin | `{ "network_status" }` | `200` |
| `POST` | `/api/admin/memberships/:id/cohort` | Liga ou tira turma | Super-admin | `{ "cohortId": uuid \| null }` | `{ ok }` |
| `DELETE` | `/api/admin/memberships/:id` | Remove a membership | Super-admin | — | `{ ok }` |
| `GET` | `/api/admin/communities/:id/fields` | Catálogo ops (grupos na ordem do perfil; `locked` no grupo seed e no campo se `storage` ≠ `attributes`) | Super-admin | — | `{ "data": OpsCatalogGroup[] }` com `fields[].options: [{ value, labelPt, labelEn }]` |
| `POST` | `/api/admin/communities/:id/fields` | Cria campo `attributes` (tipos do catálogo; `span` 1–3; `required` default false) | Super-admin | `{ groupId, name, type, labelPt, labelEn, options?, optionsText?, filterable?, span?, required? }` — `select`/`radio`/`checkbox` exigem `options[]` (ou `optionsText` legado) | `{ 201, OpsCatalogField }` |
| `PATCH` | `/api/admin/communities/:id/fields/:fieldId` | Sem `labelPt`: `span` **ou** `required` (qualquer campo, núcleo incluso). Com `labelPt`: label/opções/filtro se `storage=attributes` | Super-admin | `{ "span": 1 \| 2 \| 3 }` ou `{ "required": true \| false }` ou `{ labelPt, labelEn?, options?, optionsText?, filterable? }` | `{ ok }` |
| `DELETE` | `/api/admin/communities/:id/fields/:fieldId` | Apaga só `storage=attributes` | Super-admin | — | `{ ok }` |
| `POST` | `/api/admin/communities/:id/fields/:fieldId/move` | Sobe/desce **ou** muda de grupo no mesmo tenant | Super-admin | `{ "direction": "up"\|"down" }` ou `{ "groupId" }` | `{ ok }` |
| `POST` | `/api/admin/communities/:id/groups` | Cria grupo (não seed) | Super-admin | `{ labelPt, labelEn, columns?, slug? }` | `201` |
| `PATCH` | `/api/admin/communities/:id/groups/:groupId` | `columns` e/ou rótulo LocalizedText (seed incluso; slug imutável) | Super-admin | `{ "columns"?: 1\|2\|3, "labelPt"?: string, "labelEn"?: string }` | `{ ok }` |
| `DELETE` | `/api/admin/communities/:id/groups/:groupId` | Apaga grupo vazio e não-seed | Super-admin | — | `{ ok }` |
| `POST` | `/api/admin/communities/:id/groups/:groupId/move` | Sobe/desce o grupo | Super-admin | `{ "direction": "up" }` ou `"down"` | `{ ok }` |

APIs de membro de rede (`/api/directory/*`, `/api/memberships/me`, `/api/coord/*`) usam o cookie `community_slug` (e membership `active` nesse tenant). Sem contexto e com mais de uma membership: `400 VALIDATION_ERROR`. Uma membership só: default permitido. `docs/architecture/community-context.md`.

`GET /api/profiles` (lista legado) e `/admin/approvals` foram removidos. `/api/ops/*` não existe: mutações de tenant só na origem admin.

Rotas UI admin do tenant: `/communities/:id/settings|modules|members|cohorts|fields` (índice redireciona para `settings`). Em `fields`, criar grupo é ação da página; criar campo é no grupo (`groupId` fixo no POST). Globais: `/communities`, `/people`, `/platform`, `/emails`. Comunidade nova faz seed do catálogo (núcleo + directory + grupo `custom`).

## Pagination / filtering

| Param | Type | Default | Max | Description |
| ----- | ---- | ------- | --- | ----------- |
| `page` | Integer | `1` | — | Página |
| `limit` | Integer | `20` | `100` | Page size |
| `search` | String | `""` | `100` | Nome, headline, bio |
| `cohort` | UUID | — | — | Filtra diretório por turma |
| `attr.<name>` | Scalar | — | — | Facet: só campos `filterable`; traduz para `custom_attributes @>` |

## Rate limits

- `/api/auth/request-otp`: 3 / min / IP+e-mail
- `/api/profiles/:id/contact`: 5 / hora / IP
