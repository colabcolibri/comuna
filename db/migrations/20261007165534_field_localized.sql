ALTER TABLE plugin_directory.fields
  ADD COLUMN localized boolean NOT NULL DEFAULT false;

UPDATE plugin_directory.fields
SET localized = true,
    type = CASE WHEN name = 'bio' THEN 'textarea' ELSE 'text' END
WHERE type = 'localized_text';
