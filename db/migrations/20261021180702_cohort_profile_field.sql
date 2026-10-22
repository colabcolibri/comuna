ALTER TABLE plugin_directory.fields DROP CONSTRAINT IF EXISTS fields_storage_check;

ALTER TABLE plugin_directory.fields
  ADD CONSTRAINT fields_storage_check
  CHECK (storage IN ('person', 'card_column', 'attributes', 'membership'));

INSERT INTO plugin_directory.fields (
  group_id, name, type, label, description, options, span, required, localized, sort_order,
  storage, column_key, module_id, enabled
)
SELECT
  g.id,
  'cohort',
  'select',
  '[{"locale":"pt-BR","value":"Turma"},{"locale":"en","value":"Cohort"}]'::jsonb,
  '[{"locale":"pt-BR","value":"A turma em que você entrou nesta comunidade. Se não souber, deixe em branco."},{"locale":"en","value":"The cohort you joined in this community. Leave it blank if you are not sure."}]'::jsonb,
  '[]'::jsonb,
  1,
  false,
  false,
  30,
  'membership',
  'cohort_id',
  (SELECT id FROM plugin_core.modules WHERE slug = 'directory'),
  true
FROM plugin_directory.field_groups g
WHERE g.slug = 'community_copy'
  AND NOT EXISTS (
    SELECT 1
    FROM plugin_directory.fields existing
    WHERE existing.group_id = g.id
      AND existing.name = 'cohort'
  );

UPDATE plugin_directory.list_fields lf
SET filterable = CASE WHEN lf.list_key = 'directory' THEN true ELSE lf.filterable END,
    placement = CASE WHEN lf.list_key = 'directory' THEN 'card' ELSE lf.placement END
FROM plugin_directory.fields f
JOIN plugin_directory.field_groups g ON g.id = f.group_id
WHERE lf.field_id = f.id
  AND f.name = 'cohort'
  AND f.column_key = 'cohort_id'
  AND g.slug = 'community_copy';
