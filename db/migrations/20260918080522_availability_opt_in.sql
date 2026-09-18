-- availability_status is opt-in per community; disable on houses outside the demo seed set.

UPDATE plugin_directory.fields f
SET enabled = false
FROM plugin_directory.field_groups g
JOIN network_core.communities c ON c.id = g.community_id
WHERE f.group_id = g.id
  AND g.slug = 'availability'
  AND f.name = 'availability_status'
  AND c.slug NOT IN (
    'demo',
    'cerrado-lab',
    'pratica-dados',
    'mentoria-norte',
    'conservatorio-litoral',
    'saude-territorio'
  );

UPDATE plugin_directory.list_fields lf
SET placement = 'off',
    filterable = false
FROM plugin_directory.fields f
JOIN plugin_directory.field_groups g ON g.id = f.group_id
JOIN network_core.communities c ON c.id = g.community_id
WHERE lf.field_id = f.id
  AND f.name = 'availability_status'
  AND c.slug NOT IN (
    'demo',
    'cerrado-lab',
    'pratica-dados',
    'mentoria-norte',
    'conservatorio-litoral',
    'saude-territorio'
  );
