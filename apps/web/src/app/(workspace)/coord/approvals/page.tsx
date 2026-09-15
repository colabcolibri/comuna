import { resolveLegacyMemberPath } from '@/lib/server/require-member';

export default async function LegacyCoordPage() {
  await resolveLegacyMemberPath('/coord/approvals');
}
