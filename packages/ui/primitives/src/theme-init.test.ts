import { describe, expect, it } from 'vitest';
import { THEME_INIT_SCRIPT, THEME_INIT_SCRIPT_ID } from './theme-init';

describe('theme init script', () => {
  it('applies class and color-scheme from localStorage before paint', () => {
    expect(THEME_INIT_SCRIPT_ID).toBe('theme-init');
    expect(THEME_INIT_SCRIPT).toContain('localStorage.getItem("theme")');
    expect(THEME_INIT_SCRIPT).toContain('classList');
    expect(THEME_INIT_SCRIPT).toContain('colorScheme');
    expect(THEME_INIT_SCRIPT).not.toContain('<script');
  });
});
