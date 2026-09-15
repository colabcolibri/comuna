import { parseLanguages, spokenLanguageLabel } from '@community/identity';
import { availabilityLabel } from '@/lib/people/availability';

export function languageLabel(code: string, locale: string) {
  return spokenLanguageLabel(code, locale);
}

export function profileChips(
  profile: { availability_status: string | null; languages: unknown },
  copy: Record<string, string>,
  locale: string
) {
  const chips: string[] = [];
  const availability = availabilityLabel(profile.availability_status, copy);
  if (availability) {
    chips.push(availability);
  }
  for (const item of parseLanguages(profile.languages)) {
    const label = languageLabel(item.code, locale);
    if (label) {
      chips.push(label);
    }
  }
  return chips;
}
