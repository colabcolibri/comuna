# Community Platform

Plataforma genérica de comunidades (diretório + plugins). Alumni é um tipo de comunidade, não o produto.

## Phase documents

| Doc | Status | Description |
| --- | ------ | ----------- |
| [00_scope.md](00_scope.md) | draft | Núcleo de comunidades + plugins; duas apps |
| [01_tech_stack.md](01_tech_stack.md) | draft | Monorepo Next ×2, `pg`, módulos |
| [02_security.md](02_security.md) | draft | OTP, RBAC, LGPD |
| [03_user_types.md](03_user_types.md) | draft | guest, member, coordinator, super_admin |
| [04_principles.md](04_principles.md) | draft | Core vs plugin, `CONTENT` |
| [05_architecture.md](05_architecture.md) | review | Gate plugin + monorepo |
| [06_database.md](06_database.md) | draft | Perfil-base + `community_modules` |
| [07_api_contracts.md](07_api_contracts.md) | draft | Core APIs + plugin 404 se off |
| [08_environments.md](08_environments.md) | draft | Local, env |
| [09_design_system.md](09_design_system.md) | draft | Stitch membro + i18n `CONTENT` |
| [architecture/](architecture/monorepo.md) | — | Monorepo, modules, i18n |
| [stitch/](stitch/README.md) | reference | HTML (ainda com copy alumni) |
| [10_test_strategy.md](10_test_strategy.md) | draft | Vitest |
| [11_decisions.md](11_decisions.md) | draft | Índice SQLite |
| [inventory/as-is.md](inventory/as-is.md) | draft | Código atual |

## How to work

1. Aprovar `00`–`04` e **reaprovar `05`**.
2. Trabalho: **v2.0.0**, `ready: false` até refine + review.
3. `/implement-us` só com `ready: true`.
4. `python3 .agent/scripts/validate_meridian.py .`
