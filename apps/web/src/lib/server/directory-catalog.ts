import { queryAsMember } from '@community/db';
import { directoryContribution, nestCatalog, visibleCatalog } from '@community/directory';
import type { AppQueryCtx } from '@/lib/server/app-ctx';
import { moduleRuntime } from '@/lib/server/membership';

export async function listDirectoryCatalog(ctx: AppQueryCtx) {
  const on = await moduleRuntime.isEnabled(ctx.communityId, directoryContribution.slug);
  if (!on) {
    return { status: 404 as const, body: { error: { code: 'NOT_FOUND', message: 'Módulo desligado' } } };
  }
  const result = await queryAsMember(
    ctx,
    `SELECT g.slug AS group_slug, g.label AS group_label, g.description AS group_description,
            g.sort_order AS group_sort_order, g.columns,
            f.name, f.type, f.label, f.description, f.options, f.span, f.required,
            f.sort_order, f.storage, f.column_key, f.filterable, m.slug AS module_slug
     FROM plugin_directory.field_groups g
     LEFT JOIN plugin_directory.fields f ON f.group_id = g.id
     LEFT JOIN plugin_core.modules m ON m.id = f.module_id
     WHERE g.community_id = $1
     ORDER BY g.sort_order, f.sort_order NULLS LAST`,
    [ctx.communityId]
  );
  const enabled = await moduleRuntime.listEnabled(ctx.communityId);
  return {
    status: 200 as const,
    body: { groups: visibleCatalog(nestCatalog(result.rows as Record<string, unknown>[]), enabled) },
  };
}
