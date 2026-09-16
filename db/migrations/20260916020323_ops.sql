-- Ops platform singleton and email template overlays.

CREATE SCHEMA IF NOT EXISTS ops_core;

CREATE TABLE IF NOT EXISTS ops_core.platform_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name text NOT NULL DEFAULT 'Community',
  from_name text NOT NULL DEFAULT 'Community',
  from_address text NOT NULL DEFAULT '',
  support_url text NOT NULL DEFAULT '',
  logo_url text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO ops_core.platform_settings (product_name, from_name, from_address, support_url, logo_url)
SELECT 'Community', 'Community', '', '', ''
WHERE NOT EXISTS (SELECT 1 FROM ops_core.platform_settings);

CREATE TABLE IF NOT EXISTS ops_core.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL
    CHECK (kind IN ('member_otp', 'ops_otp', 'person_invite', 'contact_notice')),
  locale text NOT NULL
    CHECK (locale IN ('pt-BR', 'en')),
  subject text NOT NULL,
  heading text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  html_body text NOT NULL,
  text_body text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kind, locale)
);
