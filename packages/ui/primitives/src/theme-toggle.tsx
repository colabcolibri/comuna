'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from './components/ui/button';

const CONTENT = {
  'pt-BR': {
    toDark: 'Ativar tema escuro',
    toLight: 'Ativar tema claro',
  },
  en: {
    toDark: 'Switch to dark theme',
    toLight: 'Switch to light theme',
  },
} as const;

export function ThemeToggle() {
  const copy = CONTENT['pt-BR'];
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-11"
      aria-label={isDark ? copy.toLight : copy.toDark}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
