CREATE SCHEMA IF NOT EXISTS plugin_contact;

ALTER TABLE plugin_directory.cards
  ADD COLUMN IF NOT EXISTS custom_attributes jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS plugin_contact.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id uuid NOT NULL REFERENCES network_core.memberships (id),
  sender_email text NOT NULL,
  sender_name text,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS plugin_contact_messages_membership_idx
  ON plugin_contact.messages (membership_id, created_at);
