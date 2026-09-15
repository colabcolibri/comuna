---
title: API Contracts
status: approved
version: 1.4
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
| `GET` | `/api/community/modules` | Slugs enabled da comunidade do viewer | Public (comunidade pública) / member | — | `{ "enabled": ["directory", "showcase"] }` |
| `GET` | `/api/directory/catalog` | Grupos e campos; API **omite** campos cujo `module_id` não está enabled (núcleo sempre). 404 só se o plugin **directory** está off | Member | — | `{ "groups": [ { fields } ] }` |
| `GET` | `/api/directory/members` | Diretório rico | Member; **404 se plugin off** | query + facets | `{ "data", "meta" }` |
| `GET` | `/api/profiles/public` | Vitrine (lista + detalhe no diálogo) | Public; **404 se plugin off** | — | `{ "data": PublicProfile[] }` — campos em `docs/architecture/showcase-public.md` |
| `POST` | `/api/contact/:membershipId` | Contato mediado | Public; **404 se plugin off** | nome, e-mail, mensagem | `200` sem e-mail |
| `GET` | `/api/coord/approvals` | Fila | Coordinator | `?status=` | `{ "pending" }` |
| `POST` | `/api/coord/approvals/:membershipId` | Aprova / rejeita | Coordinator | `{ "action", "reason" }` | `{ "status" }` |
| `POST` | `/api/admin/auth/verify-otp` | Sessão admin | Public, `super_admin` | OTP | cookie `ops_token` |
| `GET` | `/api/admin/communities` | Lista comunidades | Super-admin | — | lista |
| `POST` | `/api/admin/communities` | Cria comunidade | Super-admin | `{ "slug", "name" }` | `201` |
| `PUT` | `/api/admin/communities/:id/modules/:slug` | Liga/desliga plugin | Super-admin | `{ "enabled": true }` | `200` |
| `POST` | `/api/admin/memberships/:id/role` | Atribui `coordinator` | Super-admin | `{ "network_role" }` | `200` |

`GET /api/profiles` e `/api/admin/approvals` no código atual são **legado**. `/api/ops/*` foi removido: mutações de tenant só na origem admin.

## Pagination / filtering

| Param | Type | Default | Max | Description |
| ----- | ---- | ------- | --- | ----------- |
| `page` | Integer | `1` | — | Página |
| `limit` | Integer | `20` | `100` | Page size |
| `search` | String | `""` | `100` | Nome, headline, bio |
| `skill` | String | `""` | `50` | Skill da comunidade (ainda sem tabela SQL) |
| `attr.<name>` | Scalar | — | — | Facet: só campos `filterable`; traduz para `custom_attributes @>` |

## Rate limits

- `/api/auth/request-otp`: 3 / min / IP+e-mail
- `/api/profiles/:id/contact`: 5 / hora / IP
