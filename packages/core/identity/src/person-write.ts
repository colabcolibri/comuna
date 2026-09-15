import { parsePlace, type GeoPlace } from '@community/places';
import { parseContacts, parseGender, parseLanguages, type PersonContacts, type SpokenLanguage } from './person-profile';

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
  const birthCity = parsePlace(body.birth_city);
  const currentCity = parsePlace(body.current_city);
  return {
    ok: true,
    write: {
      full_name: fullName,
      avatar_url: body.avatar_url == null || body.avatar_url === '' ? null : String(body.avatar_url),
      preferred_locale: String(body.preferred_locale || 'pt-BR'),
      gender: parseGender(body.gender),
      birth_country: birthCity?.country_code || null,
      current_country: currentCity?.country_code || null,
      birth_city: birthCity,
      current_city: currentCity,
      languages: parseLanguages(body.languages),
      contacts: parseContacts(body.contacts),
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
