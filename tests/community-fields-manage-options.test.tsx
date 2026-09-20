import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CommunityFieldsManageOptions } from '../apps/admin/components/community-fields-manage-options';

const field = {
  id: 'f1',
  name: 'startup_stage',
  type: 'select',
  storage: 'attributes',
  locked: false,
  span: 1,
  required: false,
  enabled: true,
  options: [
    { value: 'mvp', labelPt: 'MVP', labelEn: 'MVP' },
    { value: 'idea', labelPt: 'Ideia', labelEn: 'Idea' },
  ],
  optionsText: '',
  label: [{ locale: 'pt-BR', value: 'Estágio' }],
  description: [{ locale: 'pt-BR', value: 'Estágio da startup' }],
};

const copy = {
  empty: '',
  pageEmpty: '',
  add: '',
  addGroup: '',
  name: '',
  nameHelp: '',
  type: '',
  group: '',
  labelPt: 'PT',
  labelEn: 'EN',
  descriptionPt: '',
  descriptionEn: '',
  descriptionHelp: '',
  options: 'Opções',
  optionsHelp: '',
  optionValue: 'Valor',
  optionAdd: 'Adicionar',
  optionRemove: 'Remover',
  create: '',
  createGroup: '',
  locked: '',
  lockedHint: '',
  saved: 'Salvo',
  rename: '',
  cancel: 'Cancelar',
  delete: '',
  edit: '',
  save: 'Salvar',
  error: 'Erro',
  duplicate: '',
  groupNotEmpty: '',
  typeText: '',
  typeTextarea: '',
  typeBoolean: '',
  typeSelect: '',
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
  requirement: '',
  required: '',
  optional: '',
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
  manageOptionsHelp: 'Ajuda',
  optionsImpactTitle: 'Impacto',
  optionsImpactBody: 'Corpo',
  optionsImpactRemove: 'Remover {value} → {count}',
  optionsImpactRename: '',
  optionsImpactTotal: 'Total {total}',
  optionsImpactConfirm: 'Confirmar',
};

describe('CommunityFieldsManageOptions', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {
              safe: false,
              changes: [{ kind: 'remove', value: 'mvp', count: 2, requiresMigration: true }],
              totalAffected: 2,
              usage: { mvp: 2 },
            },
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            data: {
              safe: false,
              changes: [{ kind: 'remove', value: 'mvp', count: 2, requiresMigration: true }],
              totalAffected: 2,
              usage: { mvp: 2 },
            },
          }),
        })
    );
  });

  it('opens confirm dialog when preview is not safe', async () => {
    render(<CommunityFieldsManageOptions communityId="c1" field={field} copy={copy} onChanged={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: 'Gerenciar' }));
    const removeButtons = screen.getAllByRole('button', { name: 'Remover' });
    fireEvent.click(removeButtons[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await waitFor(() => {
      expect(screen.getByText('Impacto')).toBeTruthy();
    });
  });
});
