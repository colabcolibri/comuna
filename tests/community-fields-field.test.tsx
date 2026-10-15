import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CommunityFieldsField } from '../apps/admin/components/community-fields-field';

const field = {
  id: 'f1',
  name: 'startup_stage',
  type: 'select',
  storage: 'attributes',
  locked: false,
  span: 1,
  required: false,
  localized: false,
  enabled: true,
  options: [{ value: 'mvp', labelPt: 'MVP', labelEn: 'MVP' }],
  optionsText: '',
  label: [{ locale: 'pt-BR', value: 'Estágio' }],
  description: [{ locale: 'pt-BR', value: 'Estágio da startup' }],
};

const copy = {
  empty: '',
  pageEmpty: '',
  add: '',
  addGroup: '',
  name: 'Nome',
  nameHelp: '',
  type: 'Tipo',
  group: '',
  labelPt: 'PT',
  labelEn: 'EN',
  descriptionPt: 'Desc PT',
  descriptionEn: 'Desc EN',
  descriptionHelp: '',
  options: 'Opções',
  optionsHelp: '',
  optionValue: 'Valor',
  optionAdd: 'Add',
  optionRemove: 'Remove',
  create: '',
  createGroup: '',
  locked: 'Locked',
  lockedHint: '',
  saved: 'Salvo',
  rename: '',
  cancel: 'Cancelar',
  delete: '',
  edit: 'Editar',
  save: 'Salvar',
  error: 'Erro',
  duplicate: '',
  groupNotEmpty: '',
  typeText: '',
  typeTextarea: '',
  typeBoolean: '',
  typeSelect: 'lista',
  typeUrl: '',
  typeCity: '',
  typeLocalized: '',
  typeRadio: '',
  typeCheckbox: '',
  typeImage: '',
  moveUp: '',
  moveDown: '',
  columns: '',
  columnsHelp: '',
  columns1: '',
  columns2: '',
  columns3: '',
  span: '',
  spanHelp: '',
  layoutPreview: '',
  layoutPreviewHelp: '',
  requirement: 'Obrigatório',
  localized: 'Bilingue',
  yes: 'Sim',
  no: 'Não',
  required: 'Obrigatório',
  optional: 'Opcional',
  deactivate: '',
  activate: '',
  inactive: '',
  deleteTitle: '',
  deleteBody: '',
  groupDeleteTitle: '',
  groupDeleteBody: '',
  groupLabel: '',
  moveGroup: '',
  moveGroupHelp: '',
  moveGroupConfirm: '',
  resetOrder: '',
  resetOrderTitle: '',
  resetOrderBody: '',
  resetOrderOk: '',
  manageOptions: 'Gerenciar',
  manageOptionsTitle: 'Gerenciar opções',
  manageOptionsHelp: '',
  optionsImpactTitle: '',
  optionsImpactBody: '',
  optionsImpactRemove: '',
  optionsImpactRename: '',
  optionsImpactTotal: '',
  optionsImpactConfirm: '',
};

describe('CommunityFieldsField', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
  });

  it('saves metadata without sending options', async () => {
    render(
      <CommunityFieldsField
        communityId="c1"
        field={field}
        index={0}
        total={1}
        locale="pt-BR"
        copy={copy}
        onChanged={() => undefined}
        onMove={() => undefined}
        onRemove={() => undefined}
        groups={[]}
        currentGroupId="g1"
        groupColumns={1}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    fireEvent.change(screen.getByLabelText('Desc PT'), { target: { value: 'Novo texto' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
    const [, init] = vi.mocked(fetch).mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body));
    expect(init.method).toBe('PATCH');
    expect(body.descriptionPt).toBe('Novo texto');
    expect(body.options).toBeUndefined();
  });
});
