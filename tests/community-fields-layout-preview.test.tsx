import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CommunityFieldsLayoutPreview } from '../apps/admin/components/community-fields-layout-preview';
import type { OpsField } from '../apps/admin/components/community-fields-types';

function field(partial: Partial<OpsField> & Pick<OpsField, 'id' | 'name' | 'type'>): OpsField {
  return {
    storage: 'person',
    locked: true,
    filterable: false,
    span: 1,
    required: false,
    enabled: true,
    options: [],
    optionsText: '',
    label: [{ locale: 'pt-BR', value: partial.name }],
    ...partial,
  };
}

function openPreview() {
  fireEvent.click(screen.getByRole('button', { name: 'Como fica' }));
}

describe('community fields layout preview', () => {
  it('keeps the silhouette in a dialog until ops asks for it', () => {
    render(
      <CommunityFieldsLayoutPreview
        slug="identity"
        columns={1}
        locale="pt-BR"
        label="Como fica"
        help="Silhueta do perfil em tela larga."
        requiredLabel="Obrigatório"
        optionalLabel="Opcional"
        fields={[
          field({
            id: '1',
            name: 'avatar_url',
            type: 'image',
            label: [{ locale: 'pt-BR', value: 'Foto' }],
          }),
          field({
            id: '2',
            name: 'full_name',
            type: 'text',
            required: true,
            label: [{ locale: 'pt-BR', value: 'Nome completo' }],
          }),
        ]}
      />
    );
    expect(screen.getByRole('button', { name: 'Como fica' })).toBeTruthy();
    expect(screen.queryByRole('dialog')).toBeNull();
    openPreview();
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByText('Silhueta do perfil em tela larga.')).toBeTruthy();
    expect(screen.getByText('Foto')).toBeTruthy();
    expect(screen.getByText('Nome completo')).toBeTruthy();
    expect(screen.getByText('Obrigatório')).toBeTruthy();
    expect(screen.getByText('Opcional')).toBeTruthy();
  });

  it('places a wide field across two columns', () => {
    render(
      <CommunityFieldsLayoutPreview
        slug="person"
        columns={2}
        locale="pt-BR"
        label="Como fica"
        help="Prévia"
        requiredLabel="Obrigatório"
        optionalLabel="Opcional"
        fields={[
          field({
            id: 'g',
            name: 'gender',
            type: 'select',
            span: 2,
            label: [{ locale: 'pt-BR', value: 'Gênero' }],
          }),
        ]}
      />
    );
    openPreview();
    expect(screen.getByText('Gênero')).toBeTruthy();
    expect(document.querySelector('[style*="span 2"]')).toBeTruthy();
  });

  it('labels the two locale boxes of a localized_text field', () => {
    render(
      <CommunityFieldsLayoutPreview
        slug="identity"
        columns={1}
        locale="pt-BR"
        label="Como fica"
        help="Prévia"
        requiredLabel="Obrigatório"
        optionalLabel="Opcional"
        fields={[
          field({
            id: 't',
            name: 'headline',
            type: 'localized_text',
            label: [{ locale: 'pt-BR', value: 'Título' }],
          }),
        ]}
      />
    );
    openPreview();
    expect(screen.getByText('Título')).toBeTruthy();
    expect(screen.getByText('Opcional')).toBeTruthy();
    expect(screen.getByText('pt-BR')).toBeTruthy();
    expect(screen.getByText('en')).toBeTruthy();
  });
});
