CREATE SCHEMA IF NOT EXISTS plugin_core;

CREATE TABLE IF NOT EXISTS plugin_core.modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  version text NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS modules_slug_uq ON plugin_core.modules (slug);

CREATE TABLE IF NOT EXISTS network_core.community_modules (
  community_id uuid NOT NULL REFERENCES network_core.communities (id),
  module_id uuid NOT NULL REFERENCES plugin_core.modules (id),
  enabled boolean NOT NULL DEFAULT false,
  PRIMARY KEY (community_id, module_id)
);
