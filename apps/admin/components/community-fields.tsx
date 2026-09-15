'use client';

import { useEffect, useState } from 'react';
import { OpsSection } from '@community/ui-admin';
import { contentFromCatalog, pickContent } from '@community/identity';
import { useLocale } from './locale-provider';
import { uiCatalog } from '@/lang/catalog';
import { CommunityFieldsCreateGroup } from './community-fields-create-group';
import { CommunityFieldsGroup } from './community-fields-group';
import type { OpsGroup } from './community-fields-types';

const CONTENT = contentFromCatalog(uiCatalog, 'core_admin', {
  title: 'community.fields',
  help: 'community.fields_help',
  empty: 'community.fields_empty',
  pageEmpty: 'community.fields_page_empty',
  add: 'community.fields_add',
  addGroup: 'community.fields_add_group',
  name: 'community.fields_name',
  nameHelp: 'community.fields_name_help',
  type: 'community.fields_type',
  group: 'community.fields_group',
  labelPt: 'community.fields_label_pt',
  labelEn: 'community.fields_label_en',
  options: 'community.fields_options',
  optionsHelp: 'community.fields_options_help',
  optionValue: 'community.fields_option_value',
  optionAdd: 'community.fields_option_add',
  optionRemove: 'community.fields_option_remove',
  filterable: 'community.fields_filterable',
  create: 'community.fields_create',
  createGroup: 'community.fields_create_group',
  locked: 'community.fields_locked',
  lockedHint: 'community.fields_locked_hint',
  saved: 'community.fields_saved',
  rename: 'community.fields_rename',
  cancel: 'community.fields_cancel',
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
  columns: 'community.fields_columns',
  columnsHelp: 'community.fields_columns_help',
  columns1: 'community.fields_columns_1',
  columns2: 'community.fields_columns_2',
  columns3: 'community.fields_columns_3',
  span: 'community.fields_span',
  spanHelp: 'community.fields_span_help',
  layoutPreview: 'community.fields_layout_preview',
  requirement: 'community.fields_requirement',
  required: 'community.fields_required',
  optional: 'community.fields_optional',
  deactivate: 'community.fields_deactivate',
  activate: 'community.fields_activate',
  inactive: 'community.fields_inactive',
  deleteTitle: 'community.fields_delete_title',
  deleteBody: 'community.fields_delete_body',
  groupDeleteTitle: 'community.fields_group_delete_title',
  groupDeleteBody: 'community.fields_group_delete_body',
  edit: 'community.fields_edit',
  save: 'community.save',
  typeCity: 'community.fields_type_city',
  typeLocalized: 'community.fields_type_localized',
  typeRadio: 'community.fields_type_radio',
  typeCheckbox: 'community.fields_type_checkbox',
  typeImage: 'community.fields_type_image',
  groupLabel: 'community.fields_group_label',
  moveGroup: 'community.fields_move_group',
  moveGroupHelp: 'community.fields_move_group_help',
  moveGroupConfirm: 'community.fields_move_group_confirm',
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
      <div className="mb-8">
        <CommunityFieldsCreateGroup communityId={communityId} copy={copy} onCreated={load} />
      </div>
      {groups.length === 0 ? (
        <p className="text-sm text-muted-foreground">{copy.pageEmpty}</p>
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
              groups={groups}
            />
          ))}
        </div>
      )}
    </OpsSection>
  );
}
