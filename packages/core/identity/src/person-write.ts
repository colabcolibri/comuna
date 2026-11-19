import { parsePlace, type GeoPlace } from '@community/places';
import {
  isSafeAvatarUrl,
  isSafeHttpUrl,
  parseContacts,
  parseGender,
  parseLanguages,
  type PersonContacts,
  type SpokenLanguage,
} from './person-profile';

export const PERSON_PROFILE_COLUMNS = `
  full_name, avatar_url, preferred_locale, gender, birth_country, current_country,
  birth_city, current_city, languages, contacts
`;

export type PersonWrite = {
  full_name: string;
  avatar_url: string | null;
  preferred_locale: string;
  gender: ReturnType<typeof parseGender>;
  birth_country: string | null;
  current_country: string | null;
  birth_city: GeoPlace | null;
  current_city: GeoPlace | null;
  languages: SpokenLanguage[];
  contacts: PersonContacts;
};

export function personWriteFromBody(body: Record<string, unknown>):
  | { ok: true; write: PersonWrite }
  | { ok: false; message: string } {
  const fullName = String(body.full_name || '').trim();
  if (!fullName) {
    return { ok: false, message: 'full_name obrigatório' };
  }
  const rawAvatar = body.avatar_url == null || body.avatar_url === '' ? null : String(body.avatar_url).trim();
  if (rawAvatar && !isSafeAvatarUrl(rawAvatar)) {
    return { ok: false, message: 'avatar_url inválido' };
  }
  const rawContacts = body.contacts && typeof body.contacts === 'object' ? (body.contacts as Record<string, unknown>) : {};
  const normalizedContacts: Record<string, string> = {};
  for (const key of ['linkedin', 'github', 'portfolio', 'instagram'] as const) {
    const rawVal = rawContacts[key] == null ? '' : String(rawContacts[key]).trim();
    if (!rawVal) {
      normalizedContacts[key] = '';
      continue;
    }
    let candidate = rawVal;
    if (key === 'instagram' && /^@[a-zA-Z0-9._]{1,30}$/.test(rawVal)) {
      candidate = `https://instagram.com/${rawVal.slice(1)}`;
    } else if (!/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(rawVal) && rawVal.includes('.') && !rawVal.includes(' ')) {
      candidate = `https://${rawVal}`;
    }
    if (!isSafeHttpUrl(candidate)) {
      return { ok: false, message: `${key} URL inválida` };
    }
    normalizedContacts[key] = candidate;
  }
  const birthCity = parsePlace(body.birth_city);
  const currentCity = parsePlace(body.current_city);
  return {
    ok: true,
    write: {
      full_name: fullName,
      avatar_url: rawAvatar || null,
      preferred_locale: String(body.preferred_locale || 'pt-BR'),
      gender: parseGender(body.gender),
      birth_country: birthCity?.country_code || null,
      current_country: currentCity?.country_code || null,
      birth_city: birthCity,
      current_city: currentCity,
      languages: parseLanguages(body.languages),
      contacts: parseContacts(normalizedContacts),
    },
  };
}

export function personWriteSqlParams(userId: string, write: PersonWrite) {
  return [
    userId,
    write.full_name,
    write.avatar_url,
    write.preferred_locale,
    write.gender,
    write.birth_country,
    write.current_country,
    write.birth_city ? JSON.stringify(write.birth_city) : null,
    write.current_city ? JSON.stringify(write.current_city) : null,
    JSON.stringify(write.languages),
    JSON.stringify(write.contacts),
  ];
}
