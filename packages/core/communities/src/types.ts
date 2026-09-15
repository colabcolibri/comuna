export const COMMUNITY_TYPES = ['alumni', 'practice_community', 'incubator', 'mentor_network'] as const;
export type CommunityType = (typeof COMMUNITY_TYPES)[number];

export type CommunitySettings = {
  description: string;
  showcase_title: string;
  showcase_description: string;
  default_locale: 'pt-BR' | 'en';
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
  const showcase_description = String(source.showcase_description ?? '').trim().slice(0, 500);
  const default_locale = source.default_locale === 'en' ? 'en' : 'pt-BR';
  return { description, showcase_title, showcase_description, default_locale };
}

export function publicShowcaseHero(community: { name: string; settings: CommunitySettings }) {
  return {
    title: community.settings.showcase_title || community.name,
    lede: community.settings.showcase_description || community.settings.description,
  };
}
