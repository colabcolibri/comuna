-- Member opt-in for the internal directory, independent from public_showcase.

ALTER TABLE plugin_directory.cards
  ADD COLUMN IF NOT EXISTS public_directory boolean NOT NULL DEFAULT true;

INSERT INTO plugin_directory.fields (
  group_id, name, type, label, description, options, span, required, sort_order,
  storage, column_key, module_id, enabled
)
SELECT
  f.group_id,
  'public_directory',
  'boolean',
  '[{"locale":"pt-BR","value":"Mostrar no diretório interno"},{"locale":"en","value":"Show in the internal directory"}]'::jsonb,
  '[{"locale":"pt-BR","value":"Só quem liga aparece na lista desta comunidade. Desligado, os outros membros não te veem no diretório. Não controla a vitrine."},{"locale":"en","value":"Only people who turn this on appear in this community list. When off, other members do not see you in the directory. It does not control the showcase."}]'::jsonb,
  '[]'::jsonb,
  1,
  false,
  GREATEST(f.sort_order - 5, 1),
  'card_column',
  'public_directory',
  (SELECT id FROM plugin_core.modules WHERE slug = 'directory'),
  f.enabled
FROM plugin_directory.fields f
WHERE f.name = 'public_showcase'
  AND NOT EXISTS (
    SELECT 1
    FROM plugin_directory.fields existing
    WHERE existing.group_id = f.group_id
      AND existing.name = 'public_directory'
  );

UPDATE plugin_directory.list_fields lf
SET filterable = false,
    placement = 'off'
FROM plugin_directory.fields f
WHERE lf.field_id = f.id
  AND f.name IN ('public_directory', 'public_showcase');

UPDATE plugin_directory.fields
SET description = '[{"locale":"pt-BR","value":"Se esta comunidade tem vitrine, o cartão só entra com o seu sim. Não controla o diretório interno."},{"locale":"en","value":"If this community has a showcase, the card only appears with your yes. It does not control the internal directory."}]'::jsonb
WHERE name = 'public_showcase';
