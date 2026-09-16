'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { THEME_STORAGE_KEY } from './theme-init';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

type ThemeContextValue = {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (next: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function systemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function readPreference(): ThemePreference {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    if (value === 'light' || value === 'dark' || value === 'system') {
      return value;
    }
  } catch {
    /* private mode */
  }
  return 'system';
}

function applyResolved(resolved: ResolvedTheme) {
  const root = document.documentElement;
  const style = document.createElement('style');
  style.appendChild(document.createTextNode('*,*::before,*::after{transition:none!important}'));
  document.head.appendChild(style);
  root.classList.remove('light', 'dark');
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
  window.getComputedStyle(document.body);
  setTimeout(() => style.remove(), 1);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setPreference] = useState<ThemePreference>('system');
  const [resolvedTheme, setResolved] = useState<ResolvedTheme>('light');

  const apply = useCallback((preference: ThemePreference) => {
    const resolved = preference === 'system' ? systemTheme() : preference;
    applyResolved(resolved);
    setResolved(resolved);
  }, []);

  useEffect(() => {
    const preference = readPreference();
    setPreference(preference);
    apply(preference);
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onMedia = () => {
      if (readPreference() === 'system') {
        apply('system');
      }
    };
    media.addEventListener('change', onMedia);
    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY) {
        const next = readPreference();
        setPreference(next);
        apply(next);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => {
      media.removeEventListener('change', onMedia);
      window.removeEventListener('storage', onStorage);
    };
  }, [apply]);

  const setTheme = useCallback(
    (next: ThemePreference) => {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        /* private mode */
      }
      setPreference(next);
      apply(next);
    },
    [apply]
  );

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme }), [theme, resolvedTheme, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
