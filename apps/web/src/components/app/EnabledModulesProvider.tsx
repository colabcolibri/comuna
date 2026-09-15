'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { slugFromPathname } from '@/lib/people/community-path';

const EnabledModulesContext = createContext<string[]>([]);
const EnabledBySlugContext = createContext<Record<string, string[]>>({});

export function EnabledModulesProvider({
  enabled,
  children,
}: {
  enabled: string[];
  children: ReactNode;
}) {
  return <EnabledModulesContext.Provider value={enabled}>{children}</EnabledModulesContext.Provider>;
}

export function WorkspaceModules({
  enabledBySlug,
  publicEnabled,
  children,
}: {
  enabledBySlug: Record<string, string[]>;
  publicEnabled: string[];
  children: ReactNode;
}) {
  const slug = slugFromPathname(usePathname());
  const enabled = (slug && enabledBySlug[slug]) || publicEnabled;
  return (
    <EnabledBySlugContext.Provider value={enabledBySlug}>
      <EnabledModulesProvider enabled={enabled}>{children}</EnabledModulesProvider>
    </EnabledBySlugContext.Provider>
  );
}

export function useEnabledModules() {
  return useContext(EnabledModulesContext);
}

export function useEnabledBySlug() {
  return useContext(EnabledBySlugContext);
}
