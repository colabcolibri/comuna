import type { ReactNode } from 'react';
import { OpsChrome } from '@/components/ops-chrome';

export default function CommunitiesLayout({ children }: { children: ReactNode }) {
  return <OpsChrome>{children}</OpsChrome>;
}
