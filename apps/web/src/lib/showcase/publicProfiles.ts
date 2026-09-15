const PUBLIC_CONTACT_KEYS = ['linkedin', 'github', 'portfolio'] as const;

export type PublicShowcaseProfile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  current_city: unknown;
  languages: unknown;
  contacts: Record<string, string>;
  headline: unknown;
  bio: unknown;
  availability_status: string | null;
  custom_attributes: Record<string, unknown>;
};

export function publicContacts(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {};
  }
  const source = raw as Record<string, unknown>;
  const out: Record<string, string> = {};
  for (const key of PUBLIC_CONTACT_KEYS) {
    const value = source[key];
    if (typeof value === 'string' && value.startsWith('https://')) {
      out[key] = value;
    }
  }
  return out;
}

export function publicAttributes(raw: unknown, allowed: string[]): Record<string, unknown> {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {};
  }
  const source = raw as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in source) {
      out[key] = source[key];
    }
  }
  return out;
}

export function toPublicShowcaseProfile(
  row: Record<string, unknown>,
  attributeKeys: string[] = ['host_at_home']
): PublicShowcaseProfile {
  return {
    id: String(row.id),
    full_name: String(row.full_name || ''),
    avatar_url: typeof row.avatar_url === 'string' && row.avatar_url ? row.avatar_url : null,
    current_city: row.current_city ?? null,
    languages: row.languages ?? [],
    contacts: publicContacts(row.contacts),
    headline: row.headline ?? [],
    bio: row.bio ?? [],
    availability_status: typeof row.availability_status === 'string' ? row.availability_status : null,
    custom_attributes: publicAttributes(row.custom_attributes, attributeKeys),
  };
}

export function filterPublicShowcaseProfiles(members: any[]) {
  return members
    .filter((m) => m.is_public_showcase === true)
    .map((m) => {
      const { email, whatsapp, ...publicDTO } = m;
      return publicDTO;
    });
}
