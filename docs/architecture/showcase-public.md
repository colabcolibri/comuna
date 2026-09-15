---
title: Public showcase projection
updated: 2026-09-15
source: docs/05_architecture.md
---

# Vitrine — o que é público

Volta: `docs/05_architecture.md`. Lista: `GET /api/profiles/public`. Detalhe: o mesmo payload no diálogo (não há rota `/profile/:id` nesta fatia).

Só entra quem tem `cards.public_showcase = true` **e** plugin `showcase` enabled. Opt-in. Sem e-mail, WhatsApp, gênero, cidade de nascimento.

## Cartão (lista)

| Campo | Origem |
| ----- | ------ |
| `id` | `memberships.id` (contato mediado usa isto) |
| `full_name` | `person_core.profiles` |
| `avatar_url` | ponteiro; bytes em `GET /api/media/person/:userId/avatar` |
| `headline` | LocalizedText do card — o que a pessoa faz |
| `bio` | LocalizedText — descrição breve no cartão (`line-clamp-3`) e completa no diálogo |
| `current_city` | GeoPlace — no cartão: cidade + país (`displayPlaceLocality`) |
| `availability_status` | card |
| `languages` | códigos; chips (máx. 3 no cartão) |

## Diálogo (perfil público)

Cartão **mais**:

| Campo | Origem |
| ----- | ------ |
| `bio` | LocalizedText |
| `contacts` | só `linkedin` / `github` / `portfolio` se `https://` |
| `custom_attributes` | só chaves `filterable` do catálogo (ex. `host_at_home`) |

UI: `AppDialog` (header / body com `ScrollArea` / footer). **Enviar mensagem** no footer abre `AppSheet` (`right` ≥640px, `bottom` no telemóvel). O e-mail do membro nunca aparece.

## Fora

Gênero, nascimento, e-mail, telefone, `user_id` cru na lista (o avatar já é URL). Seed demo preenche o catálogo inteiro; a vitrine continua a projetar só esta tabela.
