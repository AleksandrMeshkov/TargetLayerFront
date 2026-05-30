import React from 'react';
import { MoonStar, SunMedium } from 'lucide-react';
import { useThemeMode } from '../../hooks/themeHooks/useThemeMode';

export function ProfileThemeToggle() {
  const { themeMode, toggleThemeMode } = useThemeMode();
  const isDarkTheme = themeMode === 'dark';

  return (
    <button type="button" onClick={toggleThemeMode} className="theme-button-secondary w-full sm:w-auto">
      {isDarkTheme ? <SunMedium className="h-5 w-5" /> : <MoonStar className="h-5 w-5" />}
      {isDarkTheme ? 'Светлая тема' : 'Тёмная тема'}
    </button>
  );
}