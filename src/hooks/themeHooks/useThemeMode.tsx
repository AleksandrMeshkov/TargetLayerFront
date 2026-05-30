import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ThemeMode = 'dark' | 'light';

type ThemeModeContextValue = {
  themeMode: ThemeMode;
  isDarkTheme: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
};

const THEME_STORAGE_KEY = 'targetlayer-theme';

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);

function getSystemThemeMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialThemeMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === 'dark' || storedTheme === 'light') {
    return storedTheme;
  }

  return getSystemThemeMode();
}

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(getInitialThemeMode);

  useEffect(() => {
    const root = document.documentElement;

    root.dataset.theme = themeMode;
    root.style.colorScheme = themeMode;
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  }, [themeMode]);

  const value = useMemo<ThemeModeContextValue>(
    () => ({
      themeMode,
      isDarkTheme: themeMode === 'dark',
      setThemeMode: setThemeModeState,
      toggleThemeMode: () => setThemeModeState((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark')),
    }),
    [themeMode],
  );

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);

  if (!context) {
    throw new Error('useThemeMode must be used inside ThemeModeProvider');
  }

  return context;
}