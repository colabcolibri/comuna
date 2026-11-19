'use client';

import { contentFromCatalog, pickContent } from '@community/identity';
import { useLocale } from '@/components/app/LocaleProvider';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_web', {
  copy: 'footer.copy',
  privacy: 'footer.privacy',
  terms: 'footer.terms',
});

export default function MemberFooter() {
  const copy = pickContent(CONTENT, useLocale());
  return (
    <footer className="w-full shrink-0 border-t border-border bg-card py-4 px-4 sm:px-6">
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
