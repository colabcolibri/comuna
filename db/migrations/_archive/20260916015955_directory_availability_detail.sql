-- US-0102: compact directory card does not show availability.
UPDATE plugin_directory.list_fields lf
SET placement = 'detail'
FROM plugin_directory.fields f
WHERE lf.field_id = f.id
  AND lf.list_key = 'directory'
  AND f.name = 'availability_status'
  AND lf.placement = 'card';
