'use client';

import { useLocale } from '@/components/app/LocaleProvider';
import { uiCatalog } from '@/lang/catalog';

export function useUiBind(component: string) {
  const locale = useLocale();
  return uiCatalog.bind(component, locale);
}
