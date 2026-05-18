'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';

/**
 * Theme provider custom — reemplazo de `next-themes` para evitar el warning
 * de React 19 sobre `<script>` tags en el árbol React.
 *
 * Estrategia:
 *   1. SSR: el RootLayout lee la cookie `theme` y aplica `data-theme` en
 *      `<html>` directamente desde JSX. Sin scripts inline.
 *   2. Cliente: este provider mantiene `theme` en estado, sincroniza con la
 *      cookie y maneja `prefers-color-scheme` cuando theme = 'system'.
 *   3. Cambios: actualiza estado + cookie + atributo en `<html>`.
 *
 * API compatible con next-themes (`{ theme, setTheme, resolvedTheme }`).
 */

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const COOKIE_NAME = 'theme';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 año
const ATTR = 'data-theme';

type ThemeContextValue = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === 'system' ? getSystemTheme() : theme;
}

function writeCookie(theme: Theme): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE_NAME}=${theme}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

function applyToDom(resolved: ResolvedTheme): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute(ATTR, resolved);
  document.documentElement.style.colorScheme = resolved;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
}) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() =>
    resolveTheme(defaultTheme),
  );

  // Sincroniza desde cookie al montar (cliente only)
  useLayoutEffect(() => {
    const m = document.cookie.match(/(?:^|;\s*)theme=(light|dark|system)/);
    const fromCookie = (m?.[1] as Theme | undefined) ?? defaultTheme;
    setThemeState(fromCookie);
    const resolved = resolveTheme(fromCookie);
    setResolvedTheme(resolved);
    applyToDom(resolved);
  }, [defaultTheme]);

  // Si theme = 'system', escucha cambios del SO
  useEffect(() => {
    if (theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const resolved: ResolvedTheme = media.matches ? 'dark' : 'light';
      setResolvedTheme(resolved);
      applyToDom(resolved);
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    const resolved = resolveTheme(next);
    setResolvedTheme(resolved);
    writeCookie(next);
    applyToDom(resolved);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Fallback estable si se llama fuera del provider — no rompe SSR
    return {
      theme: 'system',
      resolvedTheme: 'light',
      setTheme: () => {},
    };
  }
  return ctx;
}
