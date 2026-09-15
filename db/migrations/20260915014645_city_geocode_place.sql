-- City is a geocoded place object, not LocalizedText. Member copy stays on headline/bio only.

ALTER TABLE person_core.profiles DROP CONSTRAINT IF EXISTS profiles_birth_city_array_chk;
ALTER TABLE person_core.profiles DROP CONSTRAINT IF EXISTS profiles_current_city_array_chk;

ALTER TABLE person_core.profiles ALTER COLUMN birth_city DROP NOT NULL;
ALTER TABLE person_core.profiles ALTER COLUMN current_city DROP NOT NULL;
ALTER TABLE person_core.profiles ALTER COLUMN birth_city DROP DEFAULT;
ALTER TABLE person_core.profiles ALTER COLUMN current_city DROP DEFAULT;

UPDATE person_core.profiles
SET birth_city = CASE
  WHEN birth_city IS NULL OR birth_city = '[]'::jsonb THEN NULL
  WHEN jsonb_typeof(birth_city) = 'object' AND (birth_city ? 'osm_id' OR birth_city ? 'provider') THEN birth_city
  WHEN jsonb_typeof(birth_city) = 'array' THEN jsonb_build_object(
    'provider', 'legacy',
    'osm_id', 0,
    'osm_type', '',
    'lat', '',
    'lon', '',
    'country_code', COALESCE(birth_country, ''),
    'label', jsonb_build_object(
      'pt-BR', COALESCE((
        SELECT elem->>'value' FROM jsonb_array_elements(birth_city) elem
        WHERE elem->>'locale' = 'pt-BR' LIMIT 1
      ), ''),
      'en', COALESCE((
        SELECT elem->>'value' FROM jsonb_array_elements(birth_city) elem
        WHERE elem->>'locale' = 'en' LIMIT 1
      ), '')
    )
  )
  ELSE NULL
END;

UPDATE person_core.profiles
SET current_city = CASE
  WHEN current_city IS NULL OR current_city = '[]'::jsonb THEN NULL
  WHEN jsonb_typeof(current_city) = 'object' AND (current_city ? 'osm_id' OR current_city ? 'provider') THEN current_city
  WHEN jsonb_typeof(current_city) = 'array' THEN jsonb_build_object(
    'provider', 'legacy',
    'osm_id', 0,
    'osm_type', '',
    'lat', '',
    'lon', '',
    'country_code', COALESCE(current_country, ''),
    'label', jsonb_build_object(
      'pt-BR', COALESCE((
        SELECT elem->>'value' FROM jsonb_array_elements(current_city) elem
        WHERE elem->>'locale' = 'pt-BR' LIMIT 1
      ), ''),
      'en', COALESCE((
        SELECT elem->>'value' FROM jsonb_array_elements(current_city) elem
        WHERE elem->>'locale' = 'en' LIMIT 1
      ), '')
    )
  )
  ELSE NULL
END;

UPDATE person_core.profiles
SET birth_city = NULL
WHERE birth_city IS NOT NULL
  AND COALESCE(birth_city->'label'->>'pt-BR', '') = ''
  AND COALESCE(birth_city->'label'->>'en', '') = '';

UPDATE person_core.profiles
SET current_city = NULL
WHERE current_city IS NOT NULL
  AND COALESCE(current_city->'label'->>'pt-BR', '') = ''
  AND COALESCE(current_city->'label'->>'en', '') = '';

ALTER TABLE person_core.profiles
  DROP CONSTRAINT IF EXISTS profiles_birth_city_object_chk;

ALTER TABLE person_core.profiles
  ADD CONSTRAINT profiles_birth_city_object_chk
  CHECK (birth_city IS NULL OR jsonb_typeof(birth_city) = 'object');

ALTER TABLE person_core.profiles
  DROP CONSTRAINT IF EXISTS profiles_current_city_object_chk;

ALTER TABLE person_core.profiles
  ADD CONSTRAINT profiles_current_city_object_chk
  CHECK (current_city IS NULL OR jsonb_typeof(current_city) = 'object');
