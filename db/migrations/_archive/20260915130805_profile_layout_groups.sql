INSERT INTO plugin_directory.field_groups (
  community_id, slug, label, description, sort_order, columns
)
SELECT
  community_id,
  'links',
  '[{"locale":"pt-BR","value":"Links"},{"locale":"en","value":"Links"}]'::jsonb,
  '[{"locale":"pt-BR","value":"Onde te encontrar."},{"locale":"en","value":"Where to find you."}]'::jsonb,
  35,
  1
FROM plugin_directory.field_groups
WHERE slug = 'person'
ON CONFLICT (community_id, slug) DO UPDATE SET
  label = EXCLUDED.label,
  description = EXCLUDED.description,
  sort_order = EXCLUDED.sort_order,
  columns = EXCLUDED.columns;

UPDATE plugin_directory.fields f
SET
  group_id = links.id,
  sort_order = CASE f.name
    WHEN 'linkedin' THEN 10
    WHEN 'github' THEN 20
    WHEN 'portfolio' THEN 30
    ELSE f.sort_order
  END,
  span = 1
FROM plugin_directory.field_groups person
JOIN plugin_directory.field_groups links
  ON links.community_id = person.community_id AND links.slug = 'links'
WHERE person.slug = 'person'
  AND f.group_id = person.id
  AND f.name IN ('linkedin', 'github', 'portfolio');

UPDATE plugin_directory.field_groups
SET
  columns = 2,
  sort_order = 30,
  description = '[{"locale":"pt-BR","value":"Demografia."},{"locale":"en","value":"Demographics."}]'::jsonb
WHERE slug = 'person';

UPDATE plugin_directory.field_groups
SET sort_order = 20
WHERE slug = 'community_copy';

UPDATE plugin_directory.fields
SET span = 2
WHERE name = 'gender';

UPDATE plugin_directory.fields
SET
  span = 2,
  options = '[
    {"value":"pt","label":[{"locale":"pt-BR","value":"Português"},{"locale":"en","value":"Portuguese"}]},
    {"value":"en","label":[{"locale":"pt-BR","value":"English"},{"locale":"en","value":"English"}]},
    {"value":"es","label":[{"locale":"pt-BR","value":"Espanhol"},{"locale":"en","value":"Spanish"}]},
    {"value":"fr","label":[{"locale":"pt-BR","value":"Francês"},{"locale":"en","value":"French"}]}
  ]'::jsonb
WHERE name = 'languages';
