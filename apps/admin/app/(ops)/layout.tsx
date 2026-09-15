import type { ReactNode } from 'react';
import { OpsChrome } from '@/components/ops-chrome';

export default function OpsLayout({ children }: { children: ReactNode }) {
  return <OpsChrome>{children}</OpsChrome>;
}
