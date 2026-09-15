export function availabilityLabel(status: string | null, copy: Record<string, string>) {
  if (status === 'available_for_hire') return copy.hire;
  if (status === 'project_partner') return copy.partner;
  if (status === 'mentor') return copy.mentor;
  if (status === 'unavailable') return copy.unavailable;
  return null;
}
