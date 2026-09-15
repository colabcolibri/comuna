-- Group ledes are unused. Seed titles; required stays a field flag.

UPDATE plugin_directory.field_groups
SET description = '[]'::jsonb;

UPDATE plugin_directory.field_groups
SET label = '[{"locale":"pt-BR","value":"Nome e foto"},{"locale":"en","value":"Name and photo"}]'::jsonb
WHERE slug = 'identity';

UPDATE plugin_directory.field_groups
SET label = '[{"locale":"pt-BR","value":"Sobre você"},{"locale":"en","value":"About you"}]'::jsonb
WHERE slug = 'person';

UPDATE plugin_directory.fields
SET label = '[{"locale":"pt-BR","value":"Título"},{"locale":"en","value":"Title"}]'::jsonb
WHERE name = 'headline' AND storage = 'card_column';

UPDATE plugin_directory.fields
SET label = '[{"locale":"pt-BR","value":"Apresentação"},{"locale":"en","value":"About"}]'::jsonb
WHERE name = 'bio' AND storage = 'card_column';
