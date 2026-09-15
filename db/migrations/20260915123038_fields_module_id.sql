-- Field ownership is setup: module_id null = core. Not inferred from storage.

ALTER TABLE plugin_directory.fields
  ADD COLUMN IF NOT EXISTS module_id uuid REFERENCES plugin_core.modules (id);

UPDATE plugin_directory.fields f
SET module_id = m.id
FROM plugin_core.modules m
WHERE m.slug = 'showcase'
  AND f.name = 'public_showcase';

UPDATE plugin_directory.fields f
SET module_id = m.id
FROM plugin_core.modules m
WHERE m.slug = 'directory'
  AND f.module_id IS NULL
  AND f.storage <> 'person';
