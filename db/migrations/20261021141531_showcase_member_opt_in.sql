-- Member opt-in for the public showcase (in addition to per-field external audience).
UPDATE plugin_directory.cards
SET public_showcase = true
WHERE NOT public_showcase
  AND (
    headline_audience = 'external'
    OR bio_audience = 'external'
    OR availability_audience = 'external'
    OR EXISTS (
      SELECT 1
      FROM jsonb_each_text(COALESCE(attribute_audience, '{}'::jsonb)) aud
      WHERE aud.value = 'external'
    )
  );
