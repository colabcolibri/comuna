import { resolveLegacyMemberPath } from '@/lib/server/require-member';

export default async function LegacyDirectoryPage() {
  await resolveLegacyMemberPath('/directory');
}
