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

O cartão e o diálogo **projetam** `list_fields` com `list_key = showcase` (`docs/architecture/list-surfaces.md`). Seed: nome, foto, cidade, idiomas, headline e availability no card; bio no card (clamp); links só no diálogo; `host_at_home` (demo) no diálogo e no filtro.

| Slot | Origem |
| ----- | ------ |
| `id` | `memberships.id` (contato mediado usa isto) |
| identidade | `full_name`, `avatar_url` (sempre card) |
| `headline` / `bio` | LocalizedText do card se placement permitir |
| `current_city` | GeoPlace — cidade + país (`displayPlaceLocality`) |
| `languages` | slot próprio (não mistura com availability) |
| `availability_status` | status, não chip de idioma |
| facts | `custom_attributes` com placement ≠ `off`; **rótulo do catálogo** + valores (não badge solto) |
| links | `linkedin` / `github` / `portfolio` se `https://` e placement no detalhe |

Query: `search` (nome, headline, bio), `status` (só se availability for filtrável na vitrine), `attr.*` (só `list_fields.filterable` da vitrine), `page`, `size`. Página padrão **24**; `size` só 24, 48 ou 96. `{ data, meta: { page, pageSize, total } }`. A página Server Component chama `listPublicProfiles`; o cliente só muda a URL e abre o diálogo.

## UI

Rotas no grupo `(public)`: `/showcase`, `/c/{slug}/showcase`. Workspace fica em `(workspace)` com `MemberShell`.

Hero: `AppShowcasePortal` (título + texto do admin). Cartões: `AppShowcaseCard`. Busca rotulada; filtros no `AppFilterSheet`. Paginação acima e abaixo da grelha; seletor 24, 48 ou 96. O mesmo `AppShowcasePager` serve o diretório interno. **Lista vazia** (ninguém optou, ou o recorte não devolveu ninguém): `AppShowcaseEmpty` — título + frase, `role="status"`. Não é grelha em branco nem uma linha miúda. Casa sem opt-in e busca sem resultado usam copy diferente (`page.empty` vs `page.empty_filtered`).

UI do diálogo: `AppDialog`. **Enviar mensagem** no footer abre `AppSheet`.

## Diálogo (perfil público)

Mesmos slots na densidade `detail`. Header: nome, foto, cidade. Tagline no corpo, à esquerda, **acima** da bio e mais marcada (`text-xl semibold`); bio em `muted`. Extras à direita em `md+`. Mobile empilha. Body rola no `ScrollArea`. Sem `host_at_home` hardcoded.

## Fora

Gênero, nascimento, e-mail, telefone, `user_id` cru na lista. Diretório de membros é outra superfície, com sidebar.
