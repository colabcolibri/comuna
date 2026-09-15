-- List policy per surface. Does not DROP DATABASE.

CREATE TABLE IF NOT EXISTS plugin_directory.list_fields (
  field_id uuid NOT NULL REFERENCES plugin_directory.fields (id) ON DELETE CASCADE,
  list_key text NOT NULL CHECK (list_key IN ('directory', 'showcase')),
  filterable boolean NOT NULL DEFAULT false,
  placement text NOT NULL DEFAULT 'off' CHECK (placement IN ('off', 'detail', 'card')),
  PRIMARY KEY (field_id, list_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON plugin_directory.list_fields TO community_app;

ALTER TABLE plugin_directory.list_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_directory.list_fields FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS list_fields_community_select ON plugin_directory.list_fields;
CREATE POLICY list_fields_community_select ON plugin_directory.list_fields
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM plugin_directory.fields f
      JOIN plugin_directory.field_groups g ON g.id = f.group_id
      WHERE f.id = plugin_directory.list_fields.field_id
        AND NULLIF(current_setting('app.community_id', true), '') IS NOT NULL
        AND g.community_id = NULLIF(current_setting('app.community_id', true), '')::uuid
    )
  );

INSERT INTO plugin_directory.list_fields (field_id, list_key, filterable, placement)
SELECT
  f.id,
  k.list_key,
  CASE
    WHEN f.column_key IN ('gender', 'birth_city', 'public_showcase') THEN false
    WHEN f.column_key IN ('full_name', 'avatar_url') THEN false
    WHEN k.list_key = 'showcase' AND f.column_key = 'availability_status' THEN true
    WHEN k.list_key = 'directory' AND f.column_key = 'availability_status' THEN false
    ELSE f.filterable
  END,
  CASE
    WHEN f.column_key IN ('gender', 'birth_city', 'public_showcase') THEN 'off'
    WHEN f.column_key IN (
      'full_name', 'avatar_url', 'current_city', 'languages', 'headline', 'availability_status'
    ) THEN 'card'
    WHEN f.column_key = 'bio' AND k.list_key = 'showcase' THEN 'card'
    WHEN f.column_key = 'bio' THEN 'detail'
    WHEN f.column_key LIKE 'contacts.%' THEN 'detail'
    WHEN f.storage = 'attributes' AND f.filterable THEN 'detail'
    ELSE 'off'
  END
FROM plugin_directory.fields f
CROSS JOIN (VALUES ('directory'), ('showcase')) AS k (list_key)
ON CONFLICT (field_id, list_key) DO NOTHING;

CREATE OR REPLACE FUNCTION plugin_directory.ensure_list_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO plugin_directory.list_fields (field_id, list_key, filterable, placement)
  VALUES
    (NEW.id, 'directory', false, 'detail'),
    (NEW.id, 'showcase', false, 'off')
  ON CONFLICT (field_id, list_key) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS fields_ensure_list_fields ON plugin_directory.fields;
CREATE TRIGGER fields_ensure_list_fields
  AFTER INSERT ON plugin_directory.fields
  FOR EACH ROW
  EXECUTE PROCEDURE plugin_directory.ensure_list_fields();

ALTER TABLE plugin_directory.fields DROP COLUMN IF EXISTS filterable;
