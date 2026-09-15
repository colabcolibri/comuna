'use client';

import { createContext, useContext, type ReactNode } from 'react';

const EnabledModulesContext = createContext<string[]>([]);

export function EnabledModulesProvider({
  enabled,
  children,
}: {
  enabled: string[];
  children: ReactNode;
}) {
  return <EnabledModulesContext.Provider value={enabled}>{children}</EnabledModulesContext.Provider>;
}

export function useEnabledModules() {
  return useContext(EnabledModulesContext);
}
