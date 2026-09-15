import { resolveLegacyMemberPath } from '@/lib/server/require-member';

export default async function LegacyProfilePage() {
  await resolveLegacyMemberPath('/profile/edit');
}
