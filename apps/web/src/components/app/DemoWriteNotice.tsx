'use client';

import { useEffect, useState } from 'react';
import { AppAlertDialog } from '@community/ui-member';
import { contentFromCatalog, pickContent } from '@community/identity';
import { useLocale } from '@/components/app/LocaleProvider';
import { uiCatalog } from '@/lang/catalog';
import { isReadOnlyErrorPayload } from '@/lib/read-only-error';

const CONTENT = contentFromCatalog(uiCatalog, 'core_web', {
  title: 'demo.write_blocked',
  close: 'demo.dismiss',
});

export function DemoWriteNotice() {
  const copy = pickContent(CONTENT, useLocale());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const original = window.fetch.bind(window);
    window.fetch = async (...args) => {
      const res = await original(...args);
      if (res.status === 403) {
        const data = await res
          .clone()
          .json()
          .catch(() => null);
        if (isReadOnlyErrorPayload(data)) {
          setOpen(true);
        }
      }
      return res;
    };
    return () => {
      window.fetch = original;
    };
  }, []);

  return (
    <AppAlertDialog
      isOpen={open}
      onClose={() => setOpen(false)}
      title={copy.title}
      confirmLabel={copy.close}
      onConfirm={() => setOpen(false)}
    />
  );
}
