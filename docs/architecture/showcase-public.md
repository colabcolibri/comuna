---
title: Public showcase projection
updated: 2026-09-15
source: docs/05_architecture.md
---

# Vitrine — portal público

Volta: `docs/05_architecture.md`. Lista: `GET /api/profiles/public`. Detalhe: o mesmo payload no diálogo (não há rota `/profile/:id` nesta fatia).

A vitrine é uma **página pública**, não o workspace. Chrome: `AppPublicChrome` — **sem sidebar**. Header: marca da comunidade, locale, tema, e um CTA: **Entrar** (visitante) ou **Comunidade** (sessão; vai ao diretório do assento). O documento rola na página; não há `SidebarProvider` nem `ScrollArea` de app.

Título e texto vêm do admin (`settings.showcase_title`, `settings.showcase_description`). Vazio: título = `communities.name`; texto = `settings.description` ou o pack. Opt-in continua a ser o predicado dos dados (`cards.public_showcase = true` **e** plugin `showcase` enabled).

Só entra quem optou. Sem e-mail, WhatsApp, gênero, cidade de nascimento. Mensagem pela plataforma; o e-mail nunca entra na lista nem no diálogo.

## Lista

| Campo | Origem |
| ----- | ------ |
| `id` | `memberships.id` (contato mediado usa isto) |
| `full_name` | `person_core.profiles` |
| `avatar_url` | ponteiro; bytes em `GET /api/media/person/:userId/avatar` |
| `headline` | LocalizedText do card — o que a pessoa faz |
| `bio` | LocalizedText — `line-clamp-3` no cartão; completa no diálogo |
| `current_city` | GeoPlace — cidade + país (`displayPlaceLocality`) |
| `availability_status` | card |
| `languages` | códigos; chips (máx. 3 no cartão) |

Query: `search` (nome, headline, bio), `status`, `attr.*`, `page`. Página de **12**. `{ data, meta: { page, pageSize, total } }`. A página Server Component chama `listPublicProfiles`; o cliente só muda a URL e abre o diálogo.

## UI

Rotas no grupo `(public)`: `/showcase`, `/c/{slug}/showcase`. Workspace fica em `(workspace)` com `MemberShell`.

Hero: `AppShowcasePortal` (título + texto do admin). Cartões: `AppShowcaseCard`. Busca rotulada; filtros no `AppFilterSheet`. Paginação abaixo da grelha.

UI do diálogo: `AppDialog`. **Enviar mensagem** no footer abre `AppSheet`.

## Diálogo (perfil público)

Cartão **mais**:

| Campo | Origem |
| ----- | ------ |
| `bio` | LocalizedText |
| `contacts` | só `linkedin` / `github` / `portfolio` se `https://` |
| `custom_attributes` | só chaves `filterable` do catálogo (ex. `host_at_home`) |

## Fora

Gênero, nascimento, e-mail, telefone, `user_id` cru na lista. Diretório de membros é outra superfície, com sidebar.
