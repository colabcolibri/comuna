-- Overlay copy fields. HTML/text remain generated snapshots of the shared template.
-- Never DROP DATABASE.

ALTER TABLE ops_core.email_templates
  ADD COLUMN IF NOT EXISTS heading text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS body text NOT NULL DEFAULT '';
