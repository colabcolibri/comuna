---
title: Community context (member workspace)
updated: 2026-09-15
source: docs/05_architecture.md
---

# Contexto de comunidade (membro)

Volta: `docs/05_architecture.md` § Communities e memberships.

A pessoa pode ter **várias** memberships `active`. O produto mostra **uma comunidade por vez**. Não é Discord (servidores + canais). É o workspace do Slack: escolher *onde estou*, depois os destinos *desta* comunidade.

## Resolução do tenant

`ORDER BY joined_at DESC LIMIT 1` **não** é o contexto. O tenant da request é:

1. **Slug na URL** em rotas `/c/{slug}/…` (fonte de verdade para páginas).
2. **Cookie** `community_slug` nas Route Handlers (mesmo tenant que a página que disparou o fetch).
3. **Visitante** sem sessão: `/showcase` lista comunidades `is_public_showcase`. Uma só: mostra as pessoas daquela. Várias: picker para `/c/{slug}/showcase`. Sem misturar tenants.

Se o slug não existe → 404. Se a sessão não tem membership `active` naquele `community_id` → 403 (página) ou `FORBIDDEN` na API. Cookie sem membership válida é ignorado.

`set_config` / `queryAsMember` usa o `community_id` **resolvido**, nunca o “último join”.

## URL

Chrome do plugin continua declarando paths canónicos (`/directory`, `/showcase`). A app **prefixa** com `/c/{slug}` na montagem. O manifesto não conhece o slug.

| Job | Path membro |
| --- | --- |
| Diretório | `/c/{slug}/directory` |
| Vitrine desta comunidade | `/c/{slug}/showcase` |
| Perfil (card deste tenant) | `/c/{slug}/profile` |
| Identidade da pessoa | `/profile` |
| Pedidos (se coordenador) | `/c/{slug}/coord/approvals` |

Paths antigos `/directory`, `/profile/edit`, `/coord/approvals` **redirecionam**. `/profile` é identidade global (não leva slug). `/c/{slug}/profile` é o card desta comunidade.

`/login` e `/` não levam slug.

## Cookie

Nome: `community_slug`. HttpOnly. Mesmo critério `Secure` que `auth_token`. O proxy em `/c/{slug}/…` grava o cookie quando o path é válido. Trocar de comunidade no chrome navega para o mesmo job noutro slug; o cookie acompanha.

APIs de membro (`/api/directory/*`, `/api/memberships/me`, `/api/coord/*`, `/api/community/modules`) leem o cookie. Sem cookie e sem membership única → `VALIDATION_ERROR` / 400 pedindo contexto, **não** o LIMIT 1 silencioso. Uma única membership ativa pode preencher o default.

`GET /api/me/communities` lista só as comunidades da pessoa (`id`, `slug`, `name`, `network_role`). Sem dump da rede.

## Chrome

Três camadas, nesta ordem:

1. **Onde estou** — topo da sidebar: nome da comunidade. Uma membership: rótulo, sem lista. Duas ou mais: lista só das `active` da pessoa. Mobile: nome no header.
2. **O que faço aqui** — destinos prefixados; `listEnabled` **desta** comunidade. Pedidos só se `network_role = coordinator` **neste** tenant.
3. **Quem eu sou** — rodapé: Meu perfil (`/profile`, identidade global) + Sair. Card e campos da comunidade: **Perfil nesta comunidade** (`/c/{slug}/profile`) no grupo do tenant.

Ao trocar: se o job atual existir no destino (mesmo path canónico e plugin on), permanece. Senão, primeiro destino enabled. Sem rail de ícones tipo Discord. Sem home de “infos da comunidade” neste epic.

Marca no header = comunidade ativa (nome / inicial), não “Alumni” genérico. Visitante: marca da plataforma; Vitrine aponta `/showcase`.

## Visitante

`/showcase` permanece público e independente do cookie. Membro autenticado no workspace usa `/c/{slug}/showcase` quando o plugin está on **naquele** tenant.

## O que não é

- Chat, canais, presença.
- Ops (`apps/admin`) — o rail de comunidades ops já existe; não misturar cookies.
- Listar todas as comunidades da rede no picker do membro.
