# Scripts

| Pasta | Conteúdo |
| --- | --- |
| `db/` | Runners: `migrate.cjs`, `reset.cjs`, `seed.cjs` (`pnpm db:*`) |
| `seed/` | Módulos de dados demo e catálogo (requeridos por `db/seed.cjs`) |
| `dev/` | Launchers do Next (`pnpm dev`, `pnpm dev:demo`, `pnpm dev:admin`, `pnpm dev:admin:demo`) |
| `lib/` | Utilitários partilhados (`load-root-env`, `pg-ssl`) |
| `profiles/` | Copy por comunidade (home, guest, etc.) |

Entrypoints expostos no `package.json` da raiz; o resto é `require` interno.
