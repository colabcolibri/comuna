import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { EmailsPanel } from '../apps/admin/components/emails-panel';
import { LocaleProvider } from '../apps/admin/components/locale-provider';
import { defaultCopy } from '../packages/core/mail/src/copy';

vi.mock('@/lang/catalog', async () => {
  const mod = await import('../apps/admin/lang/catalog');
  return { uiCatalog: mod.uiCatalog };
});

if (!HTMLElement.prototype.hasPointerCapture) {
  HTMLElement.prototype.hasPointerCapture = () => false;
}
HTMLElement.prototype.setPointerCapture = () => undefined;
HTMLElement.prototype.releasePointerCapture = () => undefined;

function wrap(node: ReactNode) {
  return <LocaleProvider initialLocale="pt-BR">{node}</LocaleProvider>;
}

const envelope = {
  product_name: 'Rede',
  from_name: 'Ops',
  from_address: 'ops@example.com',
  support_url: 'https://example.com/help',
  logo_url: '',
};

describe('emails studio', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo) => {
        const url = String(input);
        const kind = url.includes('ops_otp')
          ? 'ops_otp'
          : url.includes('person_invite')
            ? 'person_invite'
            : url.includes('contact_notice')
              ? 'contact_notice'
              : 'member_otp';
        const locale = url.includes('locale=en') ? 'en' : 'pt-BR';
        const copy = defaultCopy(kind, locale);
        return {
          ok: true,
          json: async () => ({
            data: {
              ...copy,
              overlay: false,
              envelope,
            },
          }),
        };
      })
    );
  });

  it('uses tabs, default copy, and a live template preview', async () => {
    render(wrap(<EmailsPanel />));
    expect(screen.getByRole('tab', { name: 'OTP membro' })).toBeTruthy();
    expect(screen.queryByRole('combobox')).toBeNull();
    expect((screen.getByLabelText('Assunto') as HTMLInputElement).value).toBe(
      'Seu código {{product_name}}'
    );
    expect((screen.getByLabelText('Título') as HTMLInputElement).value).toBe(
      'Entrar em {{product_name}}'
    );
    await waitFor(() => expect(screen.getByRole('button', { name: '{{product_name}}' })).toBeTruthy());
    expect(screen.queryByRole('button', { name: '{{code}}' })).toBeNull();
    const frame = screen.getByTitle('Pré-visualização');
    expect(frame.getAttribute('sandbox')).toBeNull();
    await waitFor(() => {
      const html =
        frame.contentDocument?.body?.innerHTML ||
        frame.contentDocument?.documentElement?.innerHTML ||
        frame.getAttribute('srcdoc') ||
        '';
      expect(html).toContain('123456');
      expect(html).toContain('Entrar em Rede');
    });
  });

  it('switches kind tabs and loads that kind default copy', async () => {
    render(wrap(<EmailsPanel />));
    fireEvent.keyDown(screen.getByRole('tab', { name: 'OTP membro' }), { key: 'ArrowRight' });
    await waitFor(() =>
      expect((screen.getByLabelText('Título') as HTMLInputElement).value).toBe('Acesso ops')
    );
  });

  it('inserts a copy variable into the body', async () => {
    render(wrap(<EmailsPanel />));
    const body = await screen.findByLabelText('Corpo');
    fireEvent.focus(body);
    fireEvent.click(await screen.findByRole('button', { name: '{{product_name}}' }));
    expect((body as HTMLTextAreaElement).value).toContain('{{product_name}}');
  });
});
