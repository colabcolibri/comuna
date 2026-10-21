export const COMMUNITY_TYPES = ['alumni', 'practice_community', 'incubator', 'mentor_network'] as const;
export type CommunityType = (typeof COMMUNITY_TYPES)[number];

export type CommunitySettings = {
  description: string;
  showcase_title: string;
  showcase_title_en: string;
  showcase_description: string;
  showcase_description_en: string;
  name_en: string;
  default_locale: 'pt-BR' | 'en';
  talent_exposure: 'hidden' | 'internal' | 'external';
};

export type CommunityRow = {
  id: string;
  slug: string;
  name: string;
  type: string;
  is_public_showcase: boolean;
  settings: CommunitySettings;
};

export function isCommunityType(value: string): value is CommunityType {
  return (COMMUNITY_TYPES as readonly string[]).includes(value);
}

export function parseCommunitySettings(raw: unknown): CommunitySettings {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
  const description = String(source.description ?? '').trim().slice(0, 500);
  const showcase_title = String(source.showcase_title ?? '').trim().slice(0, 80);
  const showcase_title_en = String(source.showcase_title_en ?? '').trim().slice(0, 80);
  const showcase_description = String(source.showcase_description ?? '').trim().slice(0, 500);
  const showcase_description_en = String(source.showcase_description_en ?? '').trim().slice(0, 500);
  const name_en = String(source.name_en ?? '').trim().slice(0, 120);
  const default_locale = source.default_locale === 'en' ? 'en' : 'pt-BR';
  const talent_exposure =
    source.talent_exposure === 'hidden' || source.talent_exposure === 'external' ? source.talent_exposure : 'internal';
  return {
    description,
    showcase_title,
    showcase_title_en,
    showcase_description,
    showcase_description_en,
    name_en,
    default_locale,
    talent_exposure,
  };
}

export function textForLocale(pt: string, en: string, locale: string | undefined): string {
  if (locale === 'en' && en.trim()) {
    return en.trim();
  }
  return pt.trim();
}

export function displayCommunityName(name: string, nameEn: string, locale: string | undefined): string {
  return textForLocale(name, nameEn, locale) || name;
}

export function publicShowcaseHero(
  community: { name: string; settings: CommunitySettings },
  locale?: string
) {
  const title =
    textForLocale(community.settings.showcase_title, community.settings.showcase_title_en, locale) ||
    displayCommunityName(community.name, community.settings.name_en, locale);
  const lede =
    textForLocale(community.settings.showcase_description, community.settings.showcase_description_en, locale) ||
    community.settings.description;
  return { title, lede };
}
