-- Add personal Instagram contact field (transcends communities) to all existing links groups.

WITH inserted AS (
  INSERT INTO plugin_directory.fields
    (group_id, name, type, label, description, span, required, sort_order, storage, column_key, enabled)
  SELECT
    g.id,
    'instagram',
    'url',
    '{"pt-BR":"Instagram","en":"Instagram"}'::jsonb,
    '{"pt-BR":"Link completo ou @usuario (ex: @seu_nome).","en":"Full URL or @handle (e.g. @your_name)."}'::jsonb,
    1,
    false,
    15,
    'person',
    'contacts.instagram',
    true
  FROM plugin_directory.field_groups g
  WHERE g.slug = 'links'
  ON CONFLICT (group_id, name) DO NOTHING
  RETURNING id
)
INSERT INTO plugin_directory.list_fields (field_id, list_key, filterable, placement)
SELECT id, lk.list_key, false, 'detail'
FROM inserted
CROSS JOIN (VALUES ('directory'), ('showcase')) AS lk(list_key)
ON CONFLICT (field_id, list_key) DO NOTHING;
