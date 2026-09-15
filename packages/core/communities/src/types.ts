export const COMMUNITY_TYPES = ['alumni', 'practice_community', 'incubator', 'mentor_network'] as const;
export type CommunityType = (typeof COMMUNITY_TYPES)[number];

export type CommunitySettings = {
  description: string;
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
  const default_locale = source.default_locale === 'en' ? 'en' : 'pt-BR';
  return { description, default_locale };
}
