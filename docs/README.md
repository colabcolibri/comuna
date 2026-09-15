# Community Platform

Plataforma genérica de comunidades (diretório + plugins). Alumni é um tipo de comunidade, não o produto.

## Phase documents

| Doc | Status | Description |
| --- | ------ | ----------- |
| [00_scope.md](00_scope.md) | approved | Núcleo de comunidades + plugins; duas apps |
| [01_tech_stack.md](01_tech_stack.md) | approved | Monorepo Next ×2, `pg`, módulos |
| [02_security.md](02_security.md) | approved | OTP, RBAC, LGPD |
| [03_user_types.md](03_user_types.md) | approved | guest, member, coordinator, super_admin |
| [04_principles.md](04_principles.md) | approved | Core vs plugin, `CONTENT` |
| [05_architecture.md](05_architecture.md) | approved | Gate plugin + monorepo |
| [06_database.md](06_database.md) | approved | Perfil-base, catálogo directory, `community_modules` |
| [07_api_contracts.md](07_api_contracts.md) | approved | Core APIs + catálogo + plugin 404 se off |
| [08_environments.md](08_environments.md) | approved | Local, env |
| [09_design_system.md](09_design_system.md) | approved | Stitch membro + i18n `CONTENT` |
| [architecture/](architecture/monorepo.md) | — | Monorepo, modules, media, profile-fields, plugin-surfaces |
| [stitch/](stitch/README.md) | reference | HTML (ainda com copy alumni) |
| [10_test_strategy.md](10_test_strategy.md) | approved | Vitest |
| [11_decisions.md](11_decisions.md) | approved | Índice SQLite |
| [inventory/as-is.md](inventory/as-is.md) | draft | Código atual (transicional) |

## How to work

1. Gate `05` aprovado. Backlog: **v2.0.0**.
2. Cada US: `/refine-us` → `/review-us` → `/implement-us` → `/complete-us`.
3. `python3 .agent/scripts/validate_meridian.py .`
