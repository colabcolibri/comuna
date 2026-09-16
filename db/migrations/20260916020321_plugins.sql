-- First-party plugins: catalog, directory cards, contact.

CREATE SCHEMA IF NOT EXISTS plugin_core;
CREATE SCHEMA IF NOT EXISTS plugin_directory;
CREATE SCHEMA IF NOT EXISTS plugin_contact;

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

CREATE TABLE IF NOT EXISTS plugin_directory.cards (
  membership_id uuid PRIMARY KEY REFERENCES network_core.memberships (id),
  headline jsonb NOT NULL DEFAULT '[]'::jsonb,
  bio jsonb NOT NULL DEFAULT '[]'::jsonb,
  availability_status text,
  public_showcase boolean NOT NULL DEFAULT false,
  custom_attributes jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT cards_headline_array_chk CHECK (jsonb_typeof(headline) = 'array'),
  CONSTRAINT cards_bio_array_chk CHECK (jsonb_typeof(bio) = 'array')
);

CREATE TABLE IF NOT EXISTS plugin_contact.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id uuid NOT NULL REFERENCES network_core.memberships (id),
  sender_email text NOT NULL,
  sender_name text,
  sender_phone text,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS plugin_contact_messages_membership_idx
  ON plugin_contact.messages (membership_id, created_at);
