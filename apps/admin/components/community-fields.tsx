'use client';

import { useEffect, useState } from 'react';
import { OpsSection } from '@community/ui-admin';
import { contentFromCatalog, pickContent } from '@community/identity';
import { useLocale } from './locale-provider';
import { uiCatalog } from '@/lang/catalog';
import { CommunityFieldsCreateField } from './community-fields-create-field';
import { CommunityFieldsCreateGroup } from './community-fields-create-group';
import { CommunityFieldsGroup } from './community-fields-group';
import type { OpsGroup } from './community-fields-types';

const CONTENT = contentFromCatalog(uiCatalog, 'core_admin', {
  title: 'community.fields',
  help: 'community.fields_help',
  empty: 'community.fields_empty',
  add: 'community.fields_add',
  addGroup: 'community.fields_add_group',
  name: 'community.fields_name',
  type: 'community.fields_type',
  group: 'community.fields_group',
  labelPt: 'community.fields_label_pt',
  labelEn: 'community.fields_label_en',
  options: 'community.fields_options',
  optionsHelp: 'community.fields_options_help',
  filterable: 'community.fields_filterable',
  create: 'community.fields_create',
  createGroup: 'community.fields_create_group',
  locked: 'community.fields_locked',
  delete: 'community.fields_delete',
  error: 'community.save_error',
  duplicate: 'community.fields_duplicate',
  groupNotEmpty: 'community.fields_group_not_empty',
  typeText: 'community.fields_type_text',
  typeTextarea: 'community.fields_type_textarea',
  typeBoolean: 'community.fields_type_boolean',
  typeSelect: 'community.fields_type_select',
  typeUrl: 'community.fields_type_url',
  moveUp: 'community.fields_move_up',
  moveDown: 'community.fields_move_down',
  order: 'community.fields_order',
  columns: 'community.fields_columns',
});

export function CommunityFields({ communityId }: { communityId: string }) {
  const locale = useLocale();
  const copy = pickContent(CONTENT, locale);
  const [groups, setGroups] = useState<OpsGroup[]>([]);

  const load = () => {
    fetch(`/api/admin/communities/${communityId}/fields`).then(async (res) => {
      if (!res.ok) {
        return;
      }
      const json = await res.json();
      setGroups(json.data || []);
    });
  };

  useEffect(() => {
    load();
  }, [communityId]);

  return (
    <OpsSection title={copy.title} description={copy.help}>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
        <CommunityFieldsCreateGroup communityId={communityId} copy={copy} onCreated={load} />
        <CommunityFieldsCreateField communityId={communityId} groups={groups} locale={locale} copy={copy} onCreated={load} />
      </div>
      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">{copy.empty}</p>
      ) : (
        <div className="grid gap-4">
          {groups.map((group, index) => (
            <CommunityFieldsGroup
              key={group.id}
              communityId={communityId}
              group={group}
              index={index}
              total={groups.length}
              locale={locale}
              copy={copy}
              onChanged={load}
            />
          ))}
        </div>
      )}
    </OpsSection>
  );
}
