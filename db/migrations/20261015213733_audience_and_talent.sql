ALTER TABLE plugin_directory.cards
  ADD COLUMN IF NOT EXISTS headline_audience text NOT NULL DEFAULT 'private',
  ADD COLUMN IF NOT EXISTS bio_audience text NOT NULL DEFAULT 'private',
  ADD COLUMN IF NOT EXISTS availability_audience text NOT NULL DEFAULT 'private',
  ADD COLUMN IF NOT EXISTS attribute_audience jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE plugin_directory.cards
  DROP CONSTRAINT IF EXISTS cards_headline_audience_check,
  DROP CONSTRAINT IF EXISTS cards_bio_audience_check,
  DROP CONSTRAINT IF EXISTS cards_availability_audience_check;

ALTER TABLE plugin_directory.cards
  ADD CONSTRAINT cards_headline_audience_check CHECK (headline_audience IN ('private', 'internal', 'external')),
  ADD CONSTRAINT cards_bio_audience_check CHECK (bio_audience IN ('private', 'internal', 'external')),
  ADD CONSTRAINT cards_availability_audience_check CHECK (availability_audience IN ('private', 'internal', 'external'));

UPDATE plugin_directory.cards
SET
  headline_audience = CASE
    WHEN headline IS NULL OR headline = '[]'::jsonb OR headline = '{}'::jsonb THEN 'private'
    WHEN public_showcase THEN 'external'
    WHEN public_directory THEN 'internal'
    ELSE 'private'
  END,
  bio_audience = CASE
    WHEN bio IS NULL OR bio = '[]'::jsonb OR bio = '{}'::jsonb THEN 'private'
    WHEN public_showcase THEN 'external'
    WHEN public_directory THEN 'internal'
    ELSE 'private'
  END,
  attribute_audience = (
    SELECT COALESCE(jsonb_object_agg(
      key,
      CASE
        WHEN public_showcase THEN 'external'
        WHEN public_directory THEN 'internal'
        ELSE 'private'
      END
    ), '{}'::jsonb)
    FROM jsonb_each(COALESCE(custom_attributes, '{}'::jsonb))
  );

UPDATE plugin_directory.fields
SET enabled = false
WHERE name IN ('public_directory', 'public_showcase');

INSERT INTO plugin_core.modules (slug, version)
VALUES ('talent', '1.0.0')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO network_core.community_modules (community_id, module_id, enabled)
SELECT c.id, m.id, false
FROM network_core.communities c
JOIN plugin_core.modules m ON m.slug = 'talent'
ON CONFLICT (community_id, module_id) DO NOTHING;

CREATE SCHEMA IF NOT EXISTS plugin_talent;

CREATE TABLE IF NOT EXISTS plugin_talent.categories (
  id text PRIMARY KEY,
  sort_order integer NOT NULL,
  label jsonb NOT NULL
);

INSERT INTO plugin_talent.categories (id, sort_order, label) VALUES
  ('mentorship', 10, '{"pt-BR":"Mentoria","en":"Mentorship"}'::jsonb),
  ('project', 20, '{"pt-BR":"Projeto","en":"Project"}'::jsonb),
  ('hiring', 30, '{"pt-BR":"Contratação","en":"Hiring"}'::jsonb),
  ('teaching', 40, '{"pt-BR":"Aula","en":"Teaching"}'::jsonb),
  ('volunteering', 50, '{"pt-BR":"Voluntariado","en":"Volunteering"}'::jsonb),
  ('other', 60, '{"pt-BR":"Outros","en":"Other"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS plugin_talent.offerings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id uuid NOT NULL REFERENCES network_core.memberships (id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  url text,
  category_id text NOT NULL REFERENCES plugin_talent.categories (id),
  category_other text,
  audience text NOT NULL DEFAULT 'private',
  seed_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT offerings_audience_check CHECK (audience IN ('private', 'internal', 'external')),
  CONSTRAINT offerings_seed_key_unique UNIQUE (membership_id, seed_key)
);

CREATE INDEX IF NOT EXISTS offerings_membership_idx ON plugin_talent.offerings (membership_id);
