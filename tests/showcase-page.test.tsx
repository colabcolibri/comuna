import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { parseListField } from '@community/directory';
import { ShowcasePanel } from '../apps/web/src/components/app/ShowcasePanel';
import { LocaleProvider } from '@/components/app/LocaleProvider';
import { EnabledModulesProvider } from '@/components/app/EnabledModulesProvider';

const marina = {
  id: 'm1',
  full_name: 'Marina Silva',
  avatar_url: null,
  headline: [{ locale: 'pt-BR', value: 'Produto e comunidades' }],
  bio: [{ locale: 'pt-BR', value: 'Mentora.' }],
  current_city: { label: { 'pt-BR': 'São Paulo', en: 'Sao Paulo' } },
  languages: [
    { code: 'pt', proficiency: 'native' },
    { code: 'en', proficiency: 'fluent' },
  ],
  contacts: { linkedin: 'https://linkedin.com/in/demo-marina' },
  availability_status: 'mentor',
  custom_attributes: { host_at_home: true },
};

const listFields = [
  parseListField({ name: 'full_name', type: 'text', storage: 'person', column_key: 'full_name', placement: 'card' })!,
  parseListField({
    name: 'headline',
    type: 'localized_text',
    storage: 'card_column',
    column_key: 'headline',
    placement: 'card',
  })!,
  parseListField({ name: 'bio', type: 'localized_text', storage: 'card_column', column_key: 'bio', placement: 'card' })!,
    parseListField({
      name: 'languages',
      type: 'checkbox',
      storage: 'person',
      column_key: 'languages',
      placement: 'card',
      label: [{ locale: 'pt-BR', value: 'Idiomas que fala' }],
    })!,
];

describe('showcase panel', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: query.includes('min-width: 640px'),
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }),
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({
        ok: true,
        status: 200,
        json: async () => ({}),
      }))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders a showcase card and opens the profile dialog', async () => {
    render(
      <LocaleProvider initialLocale="pt-BR">
        <EnabledModulesProvider enabled={['showcase', 'contact-mediated']}>
          <ShowcasePanel communityName="Alumni Instituto Atlântico" rows={[marina]} listFields={listFields} total={1} />
        </EnabledModulesProvider>
      </LocaleProvider>
    );
    expect(screen.getByRole('heading', { name: 'Marina Silva' })).toBeTruthy();
    expect(screen.queryByText(/nesta vitrine/)).toBeNull();
    expect(screen.getByText('Mentora.')).toBeTruthy();
    expect(screen.getByText('Idiomas que fala')).toBeTruthy();
    screen.getByRole('button', { name: 'Ver perfil: Marina Silva' }).click();
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeTruthy();
    });
    expect(screen.getByRole('complementary')).toBeTruthy();
    const dialog = screen.getByRole('dialog');
    expect(dialog.querySelector('header')?.textContent).not.toContain('Produto e comunidades');
    expect(dialog.querySelector('[data-slot="scroll-area"]')?.textContent).toContain('Produto e comunidades');
    expect(dialog.querySelector('[data-slot="scroll-area"]')?.textContent).toContain('Mentora.');
    expect(screen.getByRole('button', { name: 'Enviar mensagem' })).toBeTruthy();
    expect(screen.queryByLabelText('E-mail')).toBeNull();
    screen.getByRole('button', { name: 'Enviar mensagem' }).click();
    await waitFor(() => {
      expect(screen.getByLabelText('E-mail')).toBeTruthy();
    });
    expect(screen.getByLabelText('Nome')).toBeTruthy();
    expect(screen.getByLabelText('Telefone')).toBeTruthy();
    expect(screen.getByText('A mensagem será enviada para Marina Silva.')).toBeTruthy();
  });

  it('shows sending state while contact is in flight', async () => {
    let resolveFetch: (value: { ok: boolean; status: number; json: () => Promise<object> }) => void = () => undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise((resolve) => {
            resolveFetch = resolve;
          })
      )
    );
    render(
      <LocaleProvider initialLocale="pt-BR">
        <EnabledModulesProvider enabled={['showcase', 'contact-mediated']}>
          <ShowcasePanel communityName="Alumni Instituto Atlântico" rows={[marina]} listFields={listFields} total={1} />
        </EnabledModulesProvider>
      </LocaleProvider>
    );
    screen.getByRole('button', { name: 'Ver perfil: Marina Silva' }).click();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Enviar mensagem' })).toBeTruthy());
    screen.getByRole('button', { name: 'Enviar mensagem' }).click();
    await waitFor(() => expect(screen.getByLabelText('E-mail')).toBeTruthy());
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Ada' } });
    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'ada@example.com' } });
    fireEvent.change(screen.getByLabelText('Telefone'), { target: { value: '+55 11 99999-0000' } });
    fireEvent.change(screen.getByLabelText('Mensagem'), {
      target: { value: 'Gostaria de conversar sobre mentoria na comunidade.' },
    });
    screen.getByRole('button', { name: 'Enviar' }).click();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Enviando…' })).toBeTruthy());
    expect((screen.getByRole('button', { name: 'Enviando…' }) as HTMLButtonElement).disabled).toBe(true);
    resolveFetch({ ok: true, status: 200, json: async () => ({}) });
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Enviando…' })).toBeNull());
  });

  it('shows an empty state when nobody opted into the showcase', () => {
    render(
      <LocaleProvider initialLocale="pt-BR">
        <EnabledModulesProvider enabled={['showcase']}>
          <ShowcasePanel communityName="Rede de mentoria Amazônia-Norte" rows={[]} total={0} />
        </EnabledModulesProvider>
      </LocaleProvider>
    );
    expect(screen.getByRole('status')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Ninguém nesta vitrine' })).toBeTruthy();
    expect(screen.getByText(/escolheu aparecer em público/)).toBeTruthy();
  });

  it('explains a search with no matches', () => {
    render(
      <LocaleProvider initialLocale="pt-BR">
        <EnabledModulesProvider enabled={['showcase']}>
          <ShowcasePanel communityName="Rede de mentoria Amazônia-Norte" rows={[]} total={0} search="zzzz" />
        </EnabledModulesProvider>
      </LocaleProvider>
    );
    expect(screen.getByRole('heading', { name: 'Nada com esse recorte' })).toBeTruthy();
    expect(screen.getByText(/busca ou com os filtros/)).toBeTruthy();
  });
});
