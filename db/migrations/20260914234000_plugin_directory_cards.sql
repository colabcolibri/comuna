CREATE SCHEMA IF NOT EXISTS plugin_directory;

CREATE TABLE IF NOT EXISTS plugin_directory.cards (
  membership_id uuid PRIMARY KEY REFERENCES network_core.memberships (id),
  headline text,
  bio text,
  availability_status text,
  public_showcase boolean NOT NULL DEFAULT false
);
