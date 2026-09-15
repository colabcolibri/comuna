import { cookies } from 'next/headers';
import { LOCALE_COOKIE, contentFromCatalog, pickContent, resolveUiLocale } from '@community/identity';
import { uiCatalog } from '@/lang/catalog';

const CONTENT = contentFromCatalog(uiCatalog, 'core_membership', {
  forbidden: 'access.forbidden',
  loadError: 'access.load_error',
});

export async function MemberAccessNotice({ kind }: { kind: 'forbidden' | 'loadError' }) {
  const locale = resolveUiLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  const copy = pickContent(CONTENT, locale);
  return <p className="p-6 text-muted-foreground">{copy[kind]}</p>;
}
