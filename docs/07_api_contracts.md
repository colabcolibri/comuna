---
title: API Contracts
status: review
version: 1.3
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
| Admin app | Cookie `ops_token` (alvo) | App `apps/admin`, não `/ops` eterno na web |

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
| `GET` | `/api/places/cities` | Busca cidade (Nominatim) | Member | `?q=` | `{ "data": GeoPlace[] }` |
| `PUT` | `/api/memberships/me` | Card do directory | Member; 404 se plugin off | `{ headline, bio }` LocalizedText, availability, vitrine | `{ ok }` |
| `GET` | `/api/directory/members` | Diretório rico | Member; **404 se plugin off** | query | `{ "data", "meta" }` |
| `GET` | `/api/showcase/profiles` | Vitrine | Public; **404 se plugin off** | query | dados públicos |
| `POST` | `/api/contact/:membershipId` | Contato mediado | Public; **404 se plugin off** | nome, e-mail, mensagem | `200` sem e-mail |
| `GET` | `/api/coord/approvals` | Fila | Coordinator | `?status=` | `{ "pending" }` |
| `POST` | `/api/coord/approvals/:membershipId` | Aprova / rejeita | Coordinator | `{ "action", "reason" }` | `{ "status" }` |
| `POST` | `/api/admin/auth/verify-otp` | Sessão admin | Public, `super_admin` | OTP | cookie `ops_token` |
| `GET` | `/api/admin/communities` | Lista comunidades | Super-admin | — | lista |
| `POST` | `/api/admin/communities` | Cria comunidade | Super-admin | `{ "slug", "name" }` | `201` |
| `PUT` | `/api/admin/communities/:id/modules/:slug` | Liga/desliga plugin | Super-admin | `{ "enabled": true }` | `200` |
| `POST` | `/api/admin/memberships/:id/role` | Atribui `coordinator` | Super-admin | `{ "network_role" }` | `200` |

`GET /api/profiles` e `/api/ops/*` e `/api/admin/approvals` no código atual são **legado**.

## Pagination / filtering

| Param | Type | Default | Max | Description |
| ----- | ---- | ------- | --- | ----------- |
| `page` | Integer | `1` | — | Página |
| `limit` | Integer | `20` | `100` | Page size |
| `search` | String | `""` | `100` | Nome, headline, bio |
| `skill` | String | `""` | `50` | Skill da comunidade |

## Rate limits

- `/api/auth/request-otp`: 3 / min / IP+e-mail
- `/api/profiles/:id/contact`: 5 / hora / IP
