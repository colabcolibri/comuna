# Migrations arquivadas

Histórico incremental **antes** do squash de 2026-09-16. Não são aplicadas pelo runner (`scripts/db-migrate.cjs` só lê `db/migrations/*.sql` na raiz).

O schema atual está nas migrations consolidadas na pasta pai. Catálogo, `list_fields`, copy e demo ficam no seed (`pnpm db:seed`).
