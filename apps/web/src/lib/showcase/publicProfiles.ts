export {
  toPersonCard as toPublicShowcaseProfile,
  type PersonCard as PublicShowcaseProfile,
  publicContacts,
  publicAttributes,
} from '@/lib/people/person-card';

export function filterPublicShowcaseProfiles(members: any[]) {
  return members
    .filter((m) => m.is_public_showcase === true)
    .map((m) => {
      const { email, whatsapp, ...publicDTO } = m;
      return publicDTO;
    });
}
