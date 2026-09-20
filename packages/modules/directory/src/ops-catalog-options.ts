import { query, withOpsContext } from '@community/db';
import type { PoolClient } from 'pg';
import { CatalogWriteError, fieldNeedsOptions, isFieldLocked } from './ops-catalog-shared';
import type { OpsChoiceOption } from './ops-catalog-fields';
import { normalizeOpsChoiceOptions, storedOptionsToOps } from './ops-catalog-fields';

export type OptionRename = { from: string; to: string };

export type ChoiceOptionChangeKind = 'add' | 'label_change' | 'remove' | 'rename';

export type ChoiceOptionChange = {
  kind: ChoiceOptionChangeKind;
  value: string;
  from?: string;
  to?: string;
  count: number;
  requiresMigration: boolean;
};

export type ChoiceOptionsPreview = {
  safe: boolean;
  changes: ChoiceOptionChange[];
  totalAffected: number;
  usage: Record<string, number>;
};

function labelsEqual(a: OpsChoiceOption, b: OpsChoiceOption) {
  return a.labelPt === b.labelPt && a.labelEn === b.labelEn;
}

export function riskyAckKeys(changes: ChoiceOptionChange[]): string[] {
  return changes
    .filter((change) => change.requiresMigration)
    .map((change) => (change.kind === 'rename' ? change.from || change.value : change.value));
}

export function diffChoiceOptions(input: {
  before: OpsChoiceOption[];
  after: OpsChoiceOption[];
  renames?: OptionRename[];
  usageCounts?: Record<string, number>;
}): ChoiceOptionChange[] {
  const usage = input.usageCounts || {};
  const renameFrom = new Set((input.renames || []).map((item) => item.from));
  const renameTo = new Set((input.renames || []).map((item) => item.to));
  const beforeByValue = new Map(input.before.map((row) => [row.value, row]));
  const afterByValue = new Map(input.after.map((row) => [row.value, row]));
  const changes: ChoiceOptionChange[] = [];

  for (const rename of input.renames || []) {
    if (!beforeByValue.has(rename.from) || !afterByValue.has(rename.to) || rename.from === rename.to) {
      continue;
    }
    const count = usage[rename.from] ?? 0;
    changes.push({
      kind: 'rename',
      value: rename.to,
      from: rename.from,
      to: rename.to,
      count,
      requiresMigration: count > 0,
    });
  }

  for (const row of input.before) {
    if (afterByValue.has(row.value) || renameFrom.has(row.value)) {
      continue;
    }
    const count = usage[row.value] ?? 0;
    changes.push({
      kind: 'remove',
      value: row.value,
      count,
      requiresMigration: count > 0,
    });
  }

  for (const row of input.after) {
    if (beforeByValue.has(row.value) || renameTo.has(row.value)) {
      continue;
    }
    changes.push({ kind: 'add', value: row.value, count: 0, requiresMigration: false });
  }

  for (const row of input.after) {
    const prev = beforeByValue.get(row.value);
    if (prev && !labelsEqual(prev, row)) {
      changes.push({ kind: 'label_change', value: row.value, count: 0, requiresMigration: false });
    }
  }

  return changes;
}

export const SCALAR_USAGE_SQL = `SELECT c.custom_attributes->>$2 AS value, count(*)::int AS count
 FROM plugin_directory.cards c
 JOIN network_core.memberships m ON m.id = c.membership_id
 WHERE m.community_id = $1
   AND m.network_status = 'active'
   AND c.custom_attributes ? $2
   AND c.custom_attributes->>$2 = ANY($3::text[])
 GROUP BY c.custom_attributes->>$2`;

export const CHECKBOX_USAGE_SQL = `SELECT val AS value, count(*)::int AS count
 FROM plugin_directory.cards c
 JOIN network_core.memberships m ON m.id = c.membership_id
 CROSS JOIN LATERAL jsonb_array_elements_text(c.custom_attributes->$2) AS val
 WHERE m.community_id = $1
   AND m.network_status = 'active'
   AND jsonb_typeof(c.custom_attributes->$2) = 'array'
   AND val = ANY($3::text[])
 GROUP BY val`;

export async function countOptionUsage(
  communityId: string,
  fieldName: string,
  fieldType: string,
  values: string[]
): Promise<Record<string, number>> {
  const trimmed = [...new Set(values.map((value) => value.trim()).filter(Boolean))];
  if (!trimmed.length || !fieldNeedsOptions(fieldType)) {
    return {};
  }
  const sql = fieldType === 'checkbox' ? CHECKBOX_USAGE_SQL : SCALAR_USAGE_SQL;
  const result = await query<{ value: string; count: number }>(sql, [communityId, fieldName, trimmed]);
  const out: Record<string, number> = {};
  for (const row of result.rows) {
    if (row.value) {
      out[row.value] = row.count;
    }
  }
  return out;
}

const SCALAR_AFFECTED_SQL = `SELECT count(DISTINCT c.membership_id)::int AS total
 FROM plugin_directory.cards c
 JOIN network_core.memberships m ON m.id = c.membership_id
 WHERE m.community_id = $1
   AND m.network_status = 'active'
   AND c.custom_attributes->>$2 = ANY($3::text[])`;

const CHECKBOX_AFFECTED_SQL = `SELECT count(DISTINCT c.membership_id)::int AS total
 FROM plugin_directory.cards c
 JOIN network_core.memberships m ON m.id = c.membership_id
 WHERE m.community_id = $1
   AND m.network_status = 'active'
   AND EXISTS (
     SELECT 1
     FROM jsonb_array_elements_text(c.custom_attributes->$2) elem
     WHERE elem = ANY($3::text[])
   )`;

async function countAffectedMemberships(
  communityId: string,
  fieldName: string,
  fieldType: string,
  values: string[]
): Promise<number> {
  const trimmed = [...new Set(values.filter(Boolean))];
  if (!trimmed.length) {
    return 0;
  }
  const sql = fieldType === 'checkbox' ? CHECKBOX_AFFECTED_SQL : SCALAR_AFFECTED_SQL;
  const result = await query<{ total: number }>(sql, [communityId, fieldName, trimmed]);
  return result.rows[0]?.total ?? 0;
}

export async function previewChoiceOptions(input: {
  communityId: string;
  fieldName: string;
  fieldType: string;
  beforeOptions: unknown;
  options?: unknown;
  optionsText?: string;
  renames?: OptionRename[];
}): Promise<ChoiceOptionsPreview> {
  const before = storedOptionsToOps(input.beforeOptions);
  const after = normalizeOpsChoiceOptions({ options: input.options, optionsText: input.optionsText });
  const usageValues = [...new Set([...before.map((row) => row.value), ...after.map((row) => row.value)])];
  const usage = await countOptionUsage(input.communityId, input.fieldName, input.fieldType, usageValues);
  const changes = diffChoiceOptions({ before, after, renames: input.renames, usageCounts: usage });
  const riskyValues = changes.filter((change) => change.requiresMigration).flatMap((change) =>
    change.kind === 'rename' ? [change.from || ''] : [change.value]
  );
  const totalAffected = await countAffectedMemberships(
    input.communityId,
    input.fieldName,
    input.fieldType,
    riskyValues
  );
  return {
    safe: !changes.some((change) => change.requiresMigration),
    changes,
    totalAffected,
    usage,
  };
}

export type LoadedChoiceField = {
  id: string;
  name: string;
  type: string;
  storage: string;
  options: unknown;
};

export async function loadChoiceField(communityId: string, fieldId: string): Promise<LoadedChoiceField | null> {
  const found = await query<{ id: string; name: string; type: string; storage: string; options: unknown }>(
    `SELECT f.id, f.name, f.type, f.storage, f.options
     FROM plugin_directory.fields f
     JOIN plugin_directory.field_groups g ON g.id = f.group_id
     WHERE f.id = $1 AND g.community_id = $2`,
    [fieldId, communityId]
  );
  const row = found.rows[0];
  if (!row || isFieldLocked(row.storage) || !fieldNeedsOptions(row.type)) {
    return null;
  }
  return row;
}

async function migrateRemove(
  client: PoolClient,
  communityId: string,
  fieldName: string,
  fieldType: string,
  value: string
) {
  if (fieldType === 'checkbox') {
    await client.query(
      `UPDATE plugin_directory.cards c
       SET custom_attributes = jsonb_set(
         c.custom_attributes,
         ARRAY[$2]::text[],
         COALESCE(
           (
             SELECT jsonb_agg(to_jsonb(elem))
             FROM jsonb_array_elements_text(c.custom_attributes->$2) elem
             WHERE elem <> $3
           ),
           '[]'::jsonb
         )
       )
       FROM network_core.memberships m
       WHERE c.membership_id = m.id
         AND m.community_id = $1
         AND m.network_status = 'active'
         AND c.custom_attributes @> jsonb_build_object($2, jsonb_build_array($3::text))`,
      [communityId, fieldName, value]
    );
    return;
  }
  await client.query(
    `UPDATE plugin_directory.cards c
     SET custom_attributes = c.custom_attributes - $2
     FROM network_core.memberships m
     WHERE c.membership_id = m.id
       AND m.community_id = $1
       AND m.network_status = 'active'
       AND c.custom_attributes->>$2 = $3`,
    [communityId, fieldName, value]
  );
}

async function migrateRename(
  client: PoolClient,
  communityId: string,
  fieldName: string,
  fieldType: string,
  from: string,
  to: string
) {
  if (fieldType === 'checkbox') {
    await client.query(
      `UPDATE plugin_directory.cards c
       SET custom_attributes = jsonb_set(
         c.custom_attributes,
         ARRAY[$2]::text[],
         (
           SELECT COALESCE(jsonb_agg(
             CASE WHEN elem = $3 THEN to_jsonb($4::text) ELSE to_jsonb(elem) END
           ), '[]'::jsonb)
           FROM jsonb_array_elements_text(c.custom_attributes->$2) elem
         )
       )
       FROM network_core.memberships m
       WHERE c.membership_id = m.id
         AND m.community_id = $1
         AND m.network_status = 'active'
         AND c.custom_attributes @> jsonb_build_object($2, jsonb_build_array($3::text))`,
      [communityId, fieldName, from, to]
    );
    return;
  }
  await client.query(
    `UPDATE plugin_directory.cards c
     SET custom_attributes = jsonb_set(c.custom_attributes - $2, ARRAY[$2], to_jsonb($4::text), true)
     FROM network_core.memberships m
     WHERE c.membership_id = m.id
       AND m.community_id = $1
       AND m.network_status = 'active'
       AND c.custom_attributes->>$2 = $3`,
    [communityId, fieldName, from, to]
  );
}

export async function applyChoiceOptions(input: {
  communityId: string;
  fieldId: string;
  options?: unknown;
  optionsText?: string;
  renames?: OptionRename[];
  acknowledged?: string[];
}): Promise<ChoiceOptionsPreview> {
  const field = await loadChoiceField(input.communityId, input.fieldId);
  if (!field) {
    throw new CatalogWriteError('NOT_FOUND');
  }
  const preview = await previewChoiceOptions({
    communityId: input.communityId,
    fieldName: field.name,
    fieldType: field.type,
    beforeOptions: field.options,
    options: input.options,
    optionsText: input.optionsText,
    renames: input.renames,
  });
  const required = riskyAckKeys(preview.changes);
  const ack = new Set((input.acknowledged || []).map((value) => value.trim()).filter(Boolean));
  if (!preview.safe && !required.every((key) => ack.has(key))) {
    throw new CatalogWriteError('ACK_MISMATCH');
  }

  const after = normalizeOpsChoiceOptions({ options: input.options, optionsText: input.optionsText });

  await withOpsContext(async (client) => {
    for (const change of preview.changes.filter((item) => item.requiresMigration)) {
      const key = change.kind === 'rename' ? change.from || change.value : change.value;
      const sql = field.type === 'checkbox' ? CHECKBOX_USAGE_SQL : SCALAR_USAGE_SQL;
      const counted = await client.query<{ value: string; count: number }>(sql, [
        input.communityId,
        field.name,
        [key],
      ]);
      const fresh = counted.rows[0]?.count ?? 0;
      if (fresh !== change.count) {
        throw new CatalogWriteError('OPTION_IN_USE');
      }
      if (change.kind === 'rename' && change.from && change.to) {
        await migrateRename(client, input.communityId, field.name, field.type, change.from, change.to);
      } else if (change.kind === 'remove') {
        await migrateRemove(client, input.communityId, field.name, field.type, change.value);
      }
    }
    await client.query(`UPDATE plugin_directory.fields SET options = $2::jsonb WHERE id = $1`, [
      field.id,
      JSON.stringify(after),
    ]);
  });

  return preview;
}
