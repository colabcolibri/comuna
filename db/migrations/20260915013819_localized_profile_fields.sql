-- Localized member copy is jsonb [{locale, value}]. Demographics live on person_core.
-- Backfill from scalar headline/bio columns, then drop the extra *_en texts.

ALTER TABLE person_core.profiles
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS birth_country text,
  ADD COLUMN IF NOT EXISTS current_country text,
  ADD COLUMN IF NOT EXISTS birth_city jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS current_city jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS languages jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS contacts jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE person_core.profiles
  DROP CONSTRAINT IF EXISTS profiles_gender_chk;

ALTER TABLE person_core.profiles
  ADD CONSTRAINT profiles_gender_chk
  CHECK (gender IS NULL OR gender IN ('woman', 'man', 'non_binary', 'prefer_not'));

ALTER TABLE person_core.profiles
  DROP CONSTRAINT IF EXISTS profiles_birth_city_array_chk;

ALTER TABLE person_core.profiles
  ADD CONSTRAINT profiles_birth_city_array_chk
  CHECK (jsonb_typeof(birth_city) = 'array');

ALTER TABLE person_core.profiles
  DROP CONSTRAINT IF EXISTS profiles_current_city_array_chk;

ALTER TABLE person_core.profiles
  ADD CONSTRAINT profiles_current_city_array_chk
  CHECK (jsonb_typeof(current_city) = 'array');

ALTER TABLE person_core.profiles
  DROP CONSTRAINT IF EXISTS profiles_languages_array_chk;

ALTER TABLE person_core.profiles
  ADD CONSTRAINT profiles_languages_array_chk
  CHECK (jsonb_typeof(languages) = 'array');

ALTER TABLE person_core.profiles
  DROP CONSTRAINT IF EXISTS profiles_contacts_object_chk;

ALTER TABLE person_core.profiles
  ADD CONSTRAINT profiles_contacts_object_chk
  CHECK (jsonb_typeof(contacts) = 'object');

ALTER TABLE plugin_directory.cards
  ADD COLUMN IF NOT EXISTS headline_i18n jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS bio_i18n jsonb NOT NULL DEFAULT '[]'::jsonb;

UPDATE plugin_directory.cards
SET headline_i18n = COALESCE((
  SELECT jsonb_agg(e.obj)
  FROM (
    SELECT jsonb_build_object('locale', 'pt-BR', 'value', headline) AS obj
    WHERE NULLIF(btrim(headline), '') IS NOT NULL
    UNION ALL
    SELECT jsonb_build_object('locale', 'en', 'value', headline_en)
    WHERE NULLIF(btrim(headline_en), '') IS NOT NULL
  ) e
), '[]'::jsonb);

UPDATE plugin_directory.cards
SET bio_i18n = COALESCE((
  SELECT jsonb_agg(e.obj)
  FROM (
    SELECT jsonb_build_object('locale', 'pt-BR', 'value', bio) AS obj
    WHERE NULLIF(btrim(bio), '') IS NOT NULL
    UNION ALL
    SELECT jsonb_build_object('locale', 'en', 'value', bio_en)
    WHERE NULLIF(btrim(bio_en), '') IS NOT NULL
  ) e
), '[]'::jsonb);

ALTER TABLE plugin_directory.cards DROP COLUMN IF EXISTS headline;
ALTER TABLE plugin_directory.cards DROP COLUMN IF EXISTS headline_en;
ALTER TABLE plugin_directory.cards DROP COLUMN IF EXISTS bio;
ALTER TABLE plugin_directory.cards DROP COLUMN IF EXISTS bio_en;

ALTER TABLE plugin_directory.cards RENAME COLUMN headline_i18n TO headline;
ALTER TABLE plugin_directory.cards RENAME COLUMN bio_i18n TO bio;

ALTER TABLE plugin_directory.cards
  DROP CONSTRAINT IF EXISTS cards_headline_array_chk;

ALTER TABLE plugin_directory.cards
  ADD CONSTRAINT cards_headline_array_chk
  CHECK (jsonb_typeof(headline) = 'array');

ALTER TABLE plugin_directory.cards
  DROP CONSTRAINT IF EXISTS cards_bio_array_chk;

ALTER TABLE plugin_directory.cards
  ADD CONSTRAINT cards_bio_array_chk
  CHECK (jsonb_typeof(bio) = 'array');
