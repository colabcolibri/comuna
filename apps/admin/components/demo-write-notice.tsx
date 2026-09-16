'use client';

import { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@community/ui';
import { contentFromCatalog, pickContent } from '@community/identity';
import { useLocale } from './locale-provider';
import { uiCatalog } from '@/lang/catalog';
import { isReadOnlyErrorPayload } from '@/lib/read-only-error';

const CONTENT = contentFromCatalog(uiCatalog, 'core_admin', {
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
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{copy.title}</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => setOpen(false)}>{copy.close}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
