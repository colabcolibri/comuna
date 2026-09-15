-- Catalog rows stay until ops disables them, then may delete.

ALTER TABLE plugin_directory.fields
  ADD COLUMN IF NOT EXISTS enabled boolean NOT NULL DEFAULT true;

ALTER TABLE plugin_directory.field_groups
  ADD COLUMN IF NOT EXISTS enabled boolean NOT NULL DEFAULT true;
