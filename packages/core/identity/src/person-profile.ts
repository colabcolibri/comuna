export const GENDERS = ['woman', 'man', 'non_binary', 'prefer_not'] as const;
export type Gender = (typeof GENDERS)[number];

export const PROFICIENCIES = ['basic', 'intermediate', 'advanced', 'fluent', 'native'] as const;
export type Proficiency = (typeof PROFICIENCIES)[number];

export type SpokenLanguage = {
  code: string;
  proficiency: Proficiency;
};

export type PersonContacts = {
  linkedin: string;
  github: string;
  portfolio: string;
  instagram: string;
};

export function parseGender(raw: unknown): Gender | null {
  const value = String(raw || '').trim();
  return (GENDERS as readonly string[]).includes(value) ? (value as Gender) : null;
}

export function parseLanguages(raw: unknown): SpokenLanguage[] {
  if (!Array.isArray(raw)) {
    return [];
  }
  const out: SpokenLanguage[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    if (!item || typeof item !== 'object') {
      continue;
    }
    const code = String((item as SpokenLanguage).code || '')
      .trim()
      .toLowerCase();
    const proficiency = (item as SpokenLanguage).proficiency;
    if (!code || seen.has(code) || !(PROFICIENCIES as readonly string[]).includes(proficiency)) {
      continue;
    }
    seen.add(code);
    out.push({ code, proficiency });
  }
  return out;
}

export function isSafeHttpUrl(raw: unknown): boolean {
  if (typeof raw !== 'string') {
    return false;
  }
  const trimmed = raw.trim();
  if (!trimmed || !/^https?:\/\/\S+$/i.test(trimmed)) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function sanitizeHttpUrl(raw: unknown): string {
  const trimmed = typeof raw === 'string' ? raw.trim() : '';
  return isSafeHttpUrl(trimmed) ? trimmed : '';
}

export function isSafeAvatarUrl(raw: unknown): boolean {
  if (typeof raw !== 'string') {
    return false;
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    return false;
  }
  if (/^\/api\/media\/person\/[a-zA-Z0-9_-]+\/avatar$/i.test(trimmed)) {
    return true;
  }
  return isSafeHttpUrl(trimmed);
}

export function parseContacts(raw: unknown): PersonContacts {
  const row = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    linkedin: sanitizeHttpUrl(row.linkedin),
    github: sanitizeHttpUrl(row.github),
    portfolio: sanitizeHttpUrl(row.portfolio),
    instagram: sanitizeHttpUrl(row.instagram),
  };
}
