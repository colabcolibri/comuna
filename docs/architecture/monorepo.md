---
title: Monorepo layout
updated: 2026-09-14
source: docs/05_architecture.md
---

# Monorepo

Volta: `docs/05_architecture.md` § Overview.

## Target tree

```txt
apps/
  web/                 # Next — membro, visitante, coordenador
  admin/               # Next — super_admin
packages/
  core/
    auth/
    db/
    identity/          # perfil-base + pickContent
    places/            # GeoPlace + CityDirectory (não é plugin)
    communities/
    memberships/
    module-runtime/
  modules/
    directory/
    showcase/
    contact-mediated/
  ui/
    primitives/        # shadcn — @community/ui
    member/            # compostos Stitch
    admin/             # compostos ops
db/
  migrations/          # SQL datado — ainda na raiz até a US mover
docs/
```

Pastas `apps/` e `packages/` existem no disco. O Next de membros vive em `apps/web/src`. CLI shadcn: `packages/ui/primitives`.

## Workspaces

Alvo: `package.json` `"workspaces": ["apps/*", "packages/core/*", "packages/modules/*", "packages/ui/*"]` e nomes `@community/<pkg>`.

## Rules

- `apps/web` não importa `packages/ui/admin`.
- `apps/admin` não importa `packages/ui/member` nem rotas Stitch.
- As duas apps importam `@community/ui` (primitives).
- Módulo não importa outro módulo; só `core`.
Código legado na raiz `src/` foi movido para `apps/web/src`.
