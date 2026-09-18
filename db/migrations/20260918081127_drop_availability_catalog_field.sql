-- availability_status is not a platform catalog field; remove seeded rows everywhere.

DELETE FROM plugin_directory.list_fields lf
USING plugin_directory.fields f
WHERE lf.field_id = f.id
  AND f.name = 'availability_status';

DELETE FROM plugin_directory.fields
WHERE name = 'availability_status';

DELETE FROM plugin_directory.field_groups g
WHERE g.slug = 'availability'
  AND NOT EXISTS (
    SELECT 1
    FROM plugin_directory.fields f
    WHERE f.group_id = g.id
  );
