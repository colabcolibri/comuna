---
title: API Contracts
status: draft
version: 1.1
updated: 2026-09-14
depends_on: [05_architecture.md, 06_database.md]
blocks: []
---

# 07 — API contracts

## API style

| Attribute | Value |
| --------- | ----- |
| **Style** | REST (JSON Endpoints / Server Actions) |
| **Base URL** | `/api` |
| **Versioning** | Inline Next.js App Router (ex: `/api/v1` ou rotas sem sufixo na v1) |
| **Documentation** | Inline em `docs/07_api_contracts.md` |

## Authentication

| Mechanism | Header / Cookie | Consistent with `02_security` |
| --------- | --------------- | ----------------------------- |
| Cookie JWT (`auth_token`) | `Cookie: auth_token=...` (HttpOnly, Secure, SameSite=Lax) | Sim (conforme `02_security` § Authentication) |

## Error envelope

Todas as respostas de erro HTTP retornam a estrutura padronizada abaixo:

```json
{
  "error": {
    "code": "INVALID_OTP",
    "message": "Código de verificação incorreto ou expirado",
    "details": []
  }
}
```

### Códigos de erro padrão

- `RATE_LIMIT_EXCEEDED` (429): Muitas solicitações enviadas.
- `UNAUTHORIZED` (401): Cookie de sessão ausente ou JWT inválido.
- `FORBIDDEN` (403): O perfil não possui privilégio necessário (`coordinator` ou `admin`).
- `NOT_FOUND` (404): Perfil ou recurso não encontrado.
- `VALIDATION_ERROR` (400): Campos da requisição inválidos (Zod).

## Endpoints

| Method | Path | Purpose | Auth | Request Body | Response (Success) |
| ------ | ---- | ------- | ---- | ------------ | ------------------ |
| `POST` | `/api/auth/request-otp` | Envia código OTP por e-mail | Public | `{ "email": "alumni@org.com" }` | `200 OK` `{ "message": "Código enviado" }` |
| `POST` | `/api/auth/verify-otp` | Valida OTP e estabelece cookie JWT | Public | `{ "email": "alumni@org.com", "code": "123456" }` | `200 OK` + `Set-Cookie` |
| `POST` | `/api/auth/logout` | Encerra a sessão atual | Authenticated | `{}` | `200 OK` + zera Cookie |
| `GET` | `/api/profiles` | Busca diretório de perfis com filtros | Authenticated | `?search=tech&skill=react&page=1` | `200 OK` `{ "data": [...], "meta": {...} }` |
| `GET` | `/api/profiles/public` | Vitrine de perfis públicos (para visitantes) | Public | `?skill=react` | `200 OK` `{ "data": [...] }` |
| `GET` | `/api/profiles/:id` | Detalhes de um perfil específico | Public / Auth | N/A | `200 OK` `{ "profile": {...} }` (sanitizado conforme cargo) |
| `PUT` | `/api/profiles/me` | Atualiza o próprio perfil | Alumni | `{ "headline": "...", "skills": [...] }` | `200 OK` `{ "profile": {...} }` |
| `POST` | `/api/profiles/:id/contact` | Envia mensagem mediada para o alumni | Public | `{ "sender_name": "...", "sender_email": "...", "message": "..." }` | `200 OK` `{ "message": "Mensagem enviada com sucesso" }` |
| `GET` | `/api/admin/approvals` | Lista membros aguardando aprovação | Coordinator / Admin | `?status=pending_approval` | `200 OK` `{ "pending": [...] }` |
| `POST` | `/api/admin/approvals/:userId` | Aprova ou rejeita cadastro de um membro | Coordinator / Admin | `{ "action": "approve", "reason": "Turma 2024 verificada" }` | `200 OK` `{ "status": "active" }` |

## Pagination / filtering

| Param | Type | Default | Max | Description |
| ----- | ---- | ------- | --- | ----------- |
| `page` | Integer | `1` | N/A | Número da página |
| `limit` | Integer | `20` | `100` | Quantidade de itens por página |
| `search` | String | `""` | `100` | Busca por nome, headline ou bio |
| `skill` | String | `""` | `50` | Filtro por nome de habilidade/talento |

## Rate limits

- `/api/auth/request-otp`: Máximo de 3 requisições por minuto por IP/E-mail.
- Contato mediado (`/contact`): Máximo de 5 envios por hora por IP (evita spam).
