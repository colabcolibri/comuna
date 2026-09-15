import { resolveUiLocale, type Locale } from './locales';

export type UiPack = Record<Locale, Record<string, string>>;

export type UiStringOverlay = {
  read(input: {
    communityId: string | null;
    component: string;
    locale: Locale;
    id: string;
  }): string | undefined;
};

export function definePack<K extends string>(pack: {
  'pt-BR': Record<K, string>;
  en: Record<K, string>;
}): UiPack {
  return pack;
}

export function interpolate(template: string, params?: Record<string, string>): string {
  if (!params) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (_, key: string) => params[key] ?? `{${key}}`);
}

export function createUiCatalog(packs: Record<string, UiPack>, overlay?: UiStringOverlay) {
  function t(
    component: string,
    id: string,
    locale: string | undefined,
    params?: Record<string, string>,
    communityId: string | null = null
  ): string {
    const resolved = resolveUiLocale(locale);
    const fromOverlay = overlay?.read({ communityId, component, locale: resolved, id });
    if (fromOverlay) {
      return interpolate(fromOverlay, params);
    }
    const pack = packs[component];
    const direct = pack?.[resolved]?.[id];
    if (direct) {
      return interpolate(direct, params);
    }
    const fallback = pack?.['pt-BR']?.[id];
    if (fallback) {
      return interpolate(fallback, params);
    }
    return id;
  }

  function bind(component: string, locale: string | undefined, communityId: string | null = null) {
    return (id: string, params?: Record<string, string>) => t(component, id, locale, params, communityId);
  }

  return { t, bind };
}

export type UiCatalog = ReturnType<typeof createUiCatalog>;

export function contentFromCatalog<K extends string>(
  catalog: Pick<UiCatalog, 't'>,
  component: string,
  fields: Record<K, string>
): { 'pt-BR': Record<K, string>; en: Record<K, string> } {
  const fill = (locale: Locale) => {
    const row = {} as Record<K, string>;
    for (const key of Object.keys(fields) as K[]) {
      row[key] = catalog.t(component, fields[key], locale);
    }
    return row;
  };
  return { 'pt-BR': fill('pt-BR'), en: fill('en') };
}

export function mergeContent<A extends Record<string, string>, B extends Record<string, string>>(
  left: { 'pt-BR': A; en: A },
  right: { 'pt-BR': B; en: B }
) {
  return {
    'pt-BR': { ...left['pt-BR'], ...right['pt-BR'] },
    en: { ...left.en, ...right.en },
  };
}
