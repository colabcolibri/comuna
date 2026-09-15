'use client';

import { pickContent } from '@community/identity';
import { useLocale } from '@/components/app/LocaleProvider';

const CONTENT = {
  'pt-BR': {
    copy: 'Diretório profissional institucional. Contato intermediado.',
    privacy: 'Privacidade',
    terms: 'Termos de uso',
  },
  en: {
    copy: 'Institutional professional directory. Mediated contact.',
    privacy: 'Privacy',
    terms: 'Terms',
  },
} as const;

export default function MemberFooter() {
  const copy = pickContent(CONTENT, useLocale());
  return (
    <footer className="w-full border-t border-outline-variant/50 bg-surface py-6 px-6 mt-auto">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <p className="text-xs text-muted-foreground max-w-xl">{copy.copy}</p>
        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <span>{copy.privacy}</span>
          <span>{copy.terms}</span>
        </div>
      </div>
    </footer>
  );
}
