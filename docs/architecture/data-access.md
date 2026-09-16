---
title: Data access pattern
updated: 2026-09-15
source: docs/05_architecture.md
---

# Acesso a dados

Volta: `docs/05_architecture.md`. Postgres via `pg` (`packages/core/db`). **Sem ORM nesta release** (`01_tech_stack`: Prisma recusado). TanStack Query **não** é o acesso a dados.

Três problemas diferentes. Misturá-los gera `useEffect` no sítio errado e `pg` no browser.

## Camadas (SRP)

| Camada | O que vive aqui | O que não vive |
| --- | --- | --- |
| SQL | `db/migrations/`, `query` / `queryAsMember` | React, cache de UI |
| Função de domínio | `peopleListQuery`, `listDirectoryMembers`, `listPublicProfiles`, `toPersonCard` | `useEffect`, `fetch` |
| HTTP | Route Handler em `app/api` — envelope `07_api_contracts.md` | JSX |
| UI | Server Component lê searchParams **ou** cliente chama `/api` | SQL, `pg` |

Barrel de plugin no Client Component **não** reexporta `@community/db` (`plugin-surfaces.md`).

```txt
Postgres
  → função de domínio (Node)
  → Route Handler (contrato)
  → página
```

A vitrine e o diretório **projetam a mesma** `PersonCard`. A diferença é o predicado (opt-in público vs membership + card), não um segundo DTO.

## O que cada ferramenta é

| Ferramenta | Camada | Quando |
| --- | --- | --- |
| SQL + `pg` | persistência | Agora. Queries explícitas, RLS, tenant. |
| ORM (Prisma/Drizzle) | ainda persistência | Só se o SQL virar um fardo. Não substitui o contrato HTTP nem o cache de UI. |
| Server Component + `searchParams` | UI de lista/filtro | Lista, busca, facets. Estado na URL. Sem `useEffect` para o GET inicial. |
| `fetch` no cliente | gesto | Formulário, OTP, upload, debounce. Uma função por endpoint (`lib/…`), não fetch solto na página. Admin: `apps/admin/lib/` (ex.: busca de pessoas para adicionar membro). |
| TanStack Query | cache do **último** hop | Quando o mesmo `GET /api/…` é lido em vários ecrãs ou o voltar-atrás fica caro. Não fala com Postgres. |

TanStack em cima de SQL é o anti-padrão. ORM + `useEffect` sem Route Handler também.

## Padrão de trabalho (listas)

1. Escrever a query e a projeção numa função Node.
2. O Route Handler só autentica e devolve JSON.
3. Filtro/busca: **URL** (`?search=`, `attr.*`, `cohort`, `status`, `country`, `near`, `radius`, `page`, `size`, `view=map`). Um construtor SQL (`peopleListQuery`): dois JOINs fixos e predicados AND. Facets em `custom_attributes` usam `@>` (GIN) só para chaves `list_fields.filterable` daquela lista. País e haversine leem `person_core.profiles`. Sem filtro de lista no cliente. Sem SQL em `@community/places`.
4. Cliente só para o que o servidor não faz: teclado, upload, diálogo, sheet.

O diretório e a vitrine **não** carregam a lista num `useEffect`. A página (Server Component) chama a função de domínio; o painel cliente só muda a URL e abre o diálogo. As duas listas paginam no SQL (`LIMIT` 24/48/96 + `count(*)`).

## Pastas (`apps/web`)

```txt
lib/server/     query + RLS + projeção (Node)
lib/people/     PersonCard, query string, projetor de lista (puro)
lib/api/        fetch de gesto (contato, OTP, upload)
app/api/**      Route Handler fino
app/c/[slug]/   Server Component do workspace: auth + tenant + searchParams
app/<rota>/     login, home, vitrine pública (sem slug)
components/app  DirectoryPanel, ShowcasePanel, PersonInspect, switcher
```

## O que não fazer

- `useEffect` + `fetch` em cada página como “arquitetura”.
- Importar `pg` / seed / ops no barrel que o `MemberShell` usa.
- Um mapper por ecrã (`toDirectoryMember` vs `toPublicShowcaseProfile`) para o mesmo cartão.
- Meter Query para “organizar” SQL.
