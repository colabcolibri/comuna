UPDATE plugin_directory.fields f
SET exposure = CASE
  WHEN EXISTS (
    SELECT 1 FROM plugin_directory.list_fields lf
    WHERE lf.field_id = f.id AND lf.list_key = 'showcase' AND lf.placement <> 'off'
  ) THEN 'external'
  WHEN EXISTS (
    SELECT 1 FROM plugin_directory.list_fields lf
    WHERE lf.field_id = f.id AND lf.list_key = 'directory' AND lf.placement <> 'off'
  ) THEN 'internal'
  ELSE 'hidden'
END
WHERE f.exposure IS NULL
  AND (
    f.storage <> 'person'
    OR f.column_key IS NULL
    OR f.column_key NOT IN (
      'full_name', 'avatar_url', 'email', 'phone', 'gender', 'current_city', 'birth_city'
    )
  );
