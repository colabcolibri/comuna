-- Directory field catalog and list surfaces. Row data comes from seed.

CREATE TABLE IF NOT EXISTS plugin_directory.field_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES network_core.communities (id) ON DELETE CASCADE,
  slug text NOT NULL,
  label jsonb NOT NULL DEFAULT '[]'::jsonb,
  description jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  columns integer NOT NULL DEFAULT 1 CHECK (columns BETWEEN 1 AND 3),
  enabled boolean NOT NULL DEFAULT true,
  UNIQUE (community_id, slug)
);

CREATE TABLE IF NOT EXISTS plugin_directory.fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES plugin_directory.field_groups (id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN (
    'text', 'textarea', 'localized_text', 'select', 'radio', 'checkbox', 'boolean', 'city', 'url', 'image'
  )),
  label jsonb NOT NULL DEFAULT '[]'::jsonb,
  description jsonb NOT NULL DEFAULT '[]'::jsonb,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  span integer NOT NULL DEFAULT 1 CHECK (span BETWEEN 1 AND 3),
  required boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  storage text NOT NULL CHECK (storage IN ('person', 'card_column', 'attributes')),
  column_key text,
  module_id uuid REFERENCES plugin_core.modules (id),
  enabled boolean NOT NULL DEFAULT true,
  UNIQUE (group_id, name)
);

CREATE INDEX IF NOT EXISTS cards_custom_attributes_gin
  ON plugin_directory.cards USING gin (custom_attributes jsonb_path_ops);

CREATE TABLE IF NOT EXISTS plugin_directory.list_fields (
  field_id uuid NOT NULL REFERENCES plugin_directory.fields (id) ON DELETE CASCADE,
  list_key text NOT NULL CHECK (list_key IN ('directory', 'showcase')),
  filterable boolean NOT NULL DEFAULT false,
  placement text NOT NULL DEFAULT 'off' CHECK (placement IN ('off', 'detail', 'card')),
  PRIMARY KEY (field_id, list_key)
);

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

ALTER TABLE plugin_directory.field_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_directory.field_groups FORCE ROW LEVEL SECURITY;
ALTER TABLE plugin_directory.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_directory.fields FORCE ROW LEVEL SECURITY;
ALTER TABLE plugin_directory.list_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_directory.list_fields FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS field_groups_community_select ON plugin_directory.field_groups;
CREATE POLICY field_groups_community_select ON plugin_directory.field_groups
  FOR SELECT
  USING (
    NULLIF(current_setting('app.community_id', true), '') IS NOT NULL
    AND community_id = NULLIF(current_setting('app.community_id', true), '')::uuid
  );

DROP POLICY IF EXISTS fields_community_select ON plugin_directory.fields;
CREATE POLICY fields_community_select ON plugin_directory.fields
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM plugin_directory.field_groups g
      WHERE g.id = plugin_directory.fields.group_id
        AND NULLIF(current_setting('app.community_id', true), '') IS NOT NULL
        AND g.community_id = NULLIF(current_setting('app.community_id', true), '')::uuid
    )
  );

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
