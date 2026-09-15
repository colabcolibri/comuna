import { LayoutGrid, Users, type LucideIcon } from 'lucide-react';
import type { ChromeIcon } from '@community/module-runtime';

const ICONS: Record<ChromeIcon, LucideIcon> = {
  users: Users,
  layoutGrid: LayoutGrid,
};

export function chromeIcon(name?: ChromeIcon): LucideIcon | null {
  if (!name) {
    return null;
  }
  return ICONS[name];
}
