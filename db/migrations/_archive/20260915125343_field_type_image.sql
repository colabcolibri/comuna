-- Allow image field type for person avatar. Does not DROP DATABASE.

ALTER TABLE plugin_directory.fields DROP CONSTRAINT IF EXISTS fields_type_check;

ALTER TABLE plugin_directory.fields
  ADD CONSTRAINT fields_type_check CHECK (type IN (
    'text', 'textarea', 'localized_text', 'select', 'radio', 'checkbox', 'boolean', 'city', 'url', 'image'
  ));

UPDATE plugin_directory.fields
SET type = 'image',
    label = '[{"locale":"pt-BR","value":"Foto"},{"locale":"en","value":"Photo"}]'::jsonb
WHERE name = 'avatar_url';
