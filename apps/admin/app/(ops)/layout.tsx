import type { ReactNode } from 'react';
import { OpsChrome } from '@/components/ops-chrome';
import { getOpsAccess } from '@/lib/ops-session';

export default async function OpsLayout({ children }: { children: ReactNode }) {
  const access = await getOpsAccess();
  const canManageNetwork = access?.communityIds === null;
  return <OpsChrome canManageNetwork={canManageNetwork}>{children}</OpsChrome>;
}
