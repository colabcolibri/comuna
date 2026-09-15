-- Directory field catalog + GIN for custom_attributes facets.
-- Does not DROP DATABASE.

CREATE TABLE IF NOT EXISTS plugin_directory.field_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES network_core.communities (id) ON DELETE CASCADE,
  slug text NOT NULL,
  label jsonb NOT NULL DEFAULT '[]'::jsonb,
  description jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  columns integer NOT NULL DEFAULT 1 CHECK (columns BETWEEN 1 AND 3),
  UNIQUE (community_id, slug)
);

CREATE TABLE IF NOT EXISTS plugin_directory.fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES plugin_directory.field_groups (id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN (
    'text', 'textarea', 'localized_text', 'select', 'radio', 'checkbox', 'boolean', 'city', 'url'
  )),
  label jsonb NOT NULL DEFAULT '[]'::jsonb,
  description jsonb NOT NULL DEFAULT '[]'::jsonb,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  span integer NOT NULL DEFAULT 1 CHECK (span BETWEEN 1 AND 3),
  required boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  storage text NOT NULL CHECK (storage IN ('person', 'card_column', 'attributes')),
  column_key text,
  filterable boolean NOT NULL DEFAULT false,
  UNIQUE (group_id, name)
);

CREATE INDEX IF NOT EXISTS cards_custom_attributes_gin
  ON plugin_directory.cards USING gin (custom_attributes jsonb_path_ops);

GRANT SELECT, INSERT, UPDATE, DELETE ON plugin_directory.field_groups TO community_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON plugin_directory.fields TO community_app;

ALTER TABLE plugin_directory.field_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_directory.field_groups FORCE ROW LEVEL SECURITY;
ALTER TABLE plugin_directory.fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_directory.fields FORCE ROW LEVEL SECURITY;

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
