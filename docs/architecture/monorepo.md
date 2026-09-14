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
    identity/          # perfil-base
    communities/
    memberships/
    module-runtime/
  modules/
    directory/
    showcase/
    contact-mediated/
  ui/
    member/            # Stitch
    admin/
db/
  migrations/          # SQL datado — ainda na raiz até a US mover
docs/
```

Pastas `apps/` e `packages/` já existem no disco com README (contrato). O Next da raiz (`src/`) **não** foi movido nesta alteração — isso é US de scaffold.

## Workspaces

Alvo: `package.json` `"workspaces": ["apps/*", "packages/core/*", "packages/modules/*", "packages/ui/*"]` e nomes `@community/<pkg>`.

## Rules

- `apps/web` não importa `packages/ui/admin`.
- `apps/admin` não importa `packages/ui/member` nem rotas Stitch.
- Módulo não importa outro módulo; só `core`.
- Código legado em `src/` some quando a US de move fechar.
