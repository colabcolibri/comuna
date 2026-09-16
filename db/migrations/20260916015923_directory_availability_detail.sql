-- Disponibilidade no diretório: só no diálogo (detail), não no card.

UPDATE plugin_directory.list_fields lf
SET placement = 'detail'
FROM plugin_directory.fields f
WHERE lf.field_id = f.id
  AND f.column_key = 'availability_status'
  AND lf.list_key = 'directory';
