import { parseLanguages } from '@community/identity';
import { availabilityLabel } from '@/lib/people/availability';

export function languageLabel(code: string, copy: Record<string, string>) {
  if (code === 'pt') return copy.langPt;
  if (code === 'en') return copy.langEn;
  if (code === 'es') return copy.langEs;
  if (code === 'fr') return copy.langFr;
  return null;
}

export function profileChips(
  profile: { availability_status: string | null; languages: unknown },
  copy: Record<string, string>
) {
  const chips: string[] = [];
  const availability = availabilityLabel(profile.availability_status, copy);
  if (availability) {
    chips.push(availability);
  }
  for (const item of parseLanguages(profile.languages)) {
    const label = languageLabel(item.code, copy);
    if (label) {
      chips.push(label);
    }
  }
  return chips;
}
