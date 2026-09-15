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

export function parseContacts(raw: unknown): PersonContacts {
  const row = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return {
    linkedin: String(row.linkedin || '').trim(),
    github: String(row.github || '').trim(),
    portfolio: String(row.portfolio || '').trim(),
  };
}
