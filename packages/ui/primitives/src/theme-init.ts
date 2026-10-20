export const THEME_STORAGE_KEY = 'theme';
export const THEME_COLOR_COOKIE = 'theme-color';

export function themeClassFromCookie(value: string | undefined): 'light' | 'dark' | null {
  return value === 'light' || value === 'dark' ? value : null;
}
export const THEME_INIT_SCRIPT_ID = 'theme-init';

/** Inline body for `next/script` `beforeInteractive` on the root layout (RSC). */
export const THEME_INIT_SCRIPT = `(function(){var d=document.documentElement;function s(){return window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}function a(t){d.classList.remove("light","dark");d.classList.add(t);d.style.colorScheme=t}try{var n=localStorage.getItem("${THEME_STORAGE_KEY}")||"system";a(n==="system"?s():n)}catch(e){a(s())}})();`;
